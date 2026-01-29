const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../../../src/app');
const { connectDb, disconnectDb } = require('../../../src/helpers/db');
const { appConfig } = require('../../../src/helpers/settings');
const { Goal, SleepEntry } = require('../../../src/models');
const {
  DEFAULT_TEST_USER_ID,
  createMockAuthMiddleware,
  createMockUserSyncMiddleware,
} = require('../../helpers/testAuth');

describe('Goal + sleep integration flow (authenticated user)', function () {
  // Allow extra time for DB + multiple HTTP calls
  this.timeout(8000);

  let app;

  before(async () => {
    // Build an app instance with mock auth middleware
    await connectDb(appConfig.MONGODB_URI);
    app = createApp({
      authMiddlewareOption: createMockAuthMiddleware(),
      userSyncMiddlewareOption: createMockUserSyncMiddleware(),
    });
  });

  beforeEach(async () => {
    // Clean up any existing goals and sleep entries for the test user
    await Promise.all([
      Goal.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
      SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
    ]);
  });

  afterEach(async () => {
    // Clean up any existing sleep for the test user after each test
    await Promise.all([
      Goal.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
      SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
    ]);
  });

  after(async () => {
    // Disconnect from DB after all tests
    await disconnectDb();
  });

  it('sets a goal in the past, records sleep entries, and returns goal stats', async () => {
    const agent = request(app);

    // Determine the target month: current month unless today is the 1st,
    // last month otherwise
    const today = new Date();
    let targetYear = today.getFullYear();
    let targetMonthIndex = today.getMonth();
    if (today.getDate() === 1) {
      targetMonthIndex -= 1;
      if (targetMonthIndex < 0) {
        targetMonthIndex = 11;
        targetYear -= 1;
      }
    }

    // Create dates within the target month for our test entries
    // Use days 5, 6, 7 which should always exist in any month
    const testDates = [
      new Date(targetYear, targetMonthIndex, 5),
      new Date(targetYear, targetMonthIndex, 6),
      new Date(targetYear, targetMonthIndex, 7),
    ];

    // Format dates as YYYY-MM-DD strings
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 1. "Sign in" and load dashboard
    const dashboardRes = await agent
      .get('/dashboard')
      .set('x-test-auth', 'true');

    expect(dashboardRes.status).to.equal(200);
    expect(dashboardRes.text).to.include('Your Sleep Trends');

    // 2. Set an 8h goal (480 minutes) for the first day of the target month
    // This ensures the goal applies to all dates in that month
    const goalDate = new Date(targetYear, targetMonthIndex, 1);
    goalDate.setHours(0, 0, 0, 0);

    await Goal.findOneAndUpdate(
      { userId: DEFAULT_TEST_USER_ID, setDate: goalDate },
      {
        $setOnInsert: { userId: DEFAULT_TEST_USER_ID, setDate: goalDate },
        $set: { goalValue: 8 * 60 },
      },
      { upsert: true, new: true }
    );

    // 3. Record three nights of sleep within the target month
    const days = [
      { date: formatDate(testDates[0]), durationMins: 8 * 60 }, // meets goal
      { date: formatDate(testDates[1]), durationMins: 7 * 60 }, // under goal
      { date: formatDate(testDates[2]), durationMins: 9 * 60 }, // exceeds goal
    ];

    for (const day of days) {
      const res = await agent
        .post('/api/sleep-entries')
        .set('x-test-auth', 'true')
        .send({
          entryTime: day.date,
          duration: day.durationMins,
          rating: 8,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
    }

    // Verify entries were created by querying them directly
    const firstOfMonth = new Date(targetYear, targetMonthIndex, 1);
    const lastOfMonth = new Date(targetYear, targetMonthIndex + 1, 0);
    firstOfMonth.setHours(0, 0, 0, 0);
    lastOfMonth.setHours(23, 59, 59, 999);

    const createdEntries = await SleepEntry.find({
      userId: DEFAULT_TEST_USER_ID,
      entryDate: { $gte: firstOfMonth, $lte: lastOfMonth },
    });

    // Ensure we have 3 entries before checking progress
    expect(createdEntries.length).to.equal(
      3,
      'Should have created 3 sleep entries in target month'
    );

    // 4. Fetch monthly goal progress
    const progressRes = await agent
      .get('/api/goal/progress')
      .set('x-test-auth', 'true');

    expect(progressRes.status).to.equal(200);
    expect(progressRes.body).to.have.property('success', true);

    const { month, stats } = progressRes.body.data;

    // Month/year should match what we calculated
    expect(month.year).to.equal(targetYear);
    expect(month.month).to.equal(targetMonthIndex + 1);

    // We logged 3 nights with data, 2 of which met or exceeded the 8h goal
    expect(stats.nightsWithData).to.equal(3);
    expect(stats.nightsTotalWithGoal).to.equal(3);
    expect(stats.nightsMetGoal).to.equal(2);

    // Average duration should be around (8 + 7 + 9) / 3 = 8h
    const expectedAvg = Math.round((8 * 60 + 7 * 60 + 9 * 60) / 3);
    expect(stats.averageDurationMinutes).to.equal(expectedAvg);

    // Projected success percent ~ 2/3 ~= 67
    const expectedPercent = Math.round((2 / 3) * 100);
    expect(stats.projectedSuccessPercent).to.equal(expectedPercent);
  });
});
