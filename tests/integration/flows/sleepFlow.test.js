const request = require('supertest');
const { expect } = require('chai');
const {
  DEFAULT_TEST_USER_ID,
  createMockAuthMiddleware,
  createMockUserSyncMiddleware,
} = require('../../helpers/testAuth');
const createApp = require('../../../src/app');
const { connectDb, disconnectDb } = require('../../../src/helpers/db');
const { appConfig } = require('../../../src/helpers/settings');
const { SleepEntry } = require('../../../src/models');

describe('Sleep entry flow integration (authenticated user)', function () {
  this.timeout(5000);

  let app;

  before(async () => {
    // Build an app instance with mock auth middleware
    await connectDb(appConfig.MONGODB_URI);
    app = createApp({
      authMiddlewareOption: createMockAuthMiddleware(DEFAULT_TEST_USER_ID),
      userSyncMiddlewareOption: createMockUserSyncMiddleware(),
    });
  });

  beforeEach(async () => {
    // Clean up any existing sleep entries for the test user
    await SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID });
  });

  afterEach(async () => {
    // Clean up any existing sleep for the test user entries after each test
    await Promise.all([
      SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
    ]);
  });

  after(async () => {
    // Disconnect from DB after all tests
    await disconnectDb();
  });

  it('allows an authenticated user to view dashboard, log, list and delete a sleep entry', async () => {
    const agent = request(app);

    // 1. Access dashboard as "authorised" user
    const dashboardRes = await agent
      .get('/dashboard')
      .set('x-test-auth', 'true');

    expect(dashboardRes.status).to.equal(200);
    expect(dashboardRes.text).to.include('My Sleep History');

    // 2. Log a new sleep entry
    const entryDate = '2026-01-01';
    const expectedDate = new Date(`${entryDate}T00:00:00`);
    const logRes = await agent
      .post('/api/sleep-entries')
      .set('x-test-auth', 'true')
      .send({
        entryTime: entryDate,
        duration: 8 * 60,
        rating: 9,
      });

    expect(logRes.status).to.equal(200);
    expect(logRes.body).to.have.property('success', true);

    const savedEntry = logRes.body.data;
    const savedDate = new Date(savedEntry.entryDate);
    // Compare by local calendar day rather than raw ISO string,
    // to avoid time zone related off‑by‑one issues.
    expect(savedDate.toDateString()).to.equal(expectedDate.toDateString());
    expect(savedEntry.duration).to.equal(8 * 60);
    expect(savedEntry.rating).to.equal(9);

    // 3. Fetch list of sleep entries and verify the new entry appears
    const listRes = await agent
      .get('/api/sleep-entries')
      .set('x-test-auth', 'true');

    expect(listRes.status).to.equal(200);
    expect(listRes.body).to.have.property('success', true);
    expect(listRes.body.data.sleepEntries).to.be.an('array').with.lengthOf(1);

    const stored = listRes.body.data.sleepEntries[0];
    const storedDate = new Date(stored.entryDate);
    expect(storedDate.toDateString()).to.equal(expectedDate.toDateString());
    expect(stored.duration).to.equal(8 * 60);
    expect(stored.rating).to.equal(9);

    // 4. Delete the sleep entry by date
    const deleteRes = await agent
      .delete(`/api/sleep-entries/${entryDate}`)
      .set('x-test-auth', 'true');

    expect(deleteRes.status).to.equal(200);
    expect(deleteRes.body).to.have.property('success', true);

    // 5. Confirm list is now empty
    const listAfterDelete = await agent
      .get('/api/sleep-entries')
      .set('x-test-auth', 'true');

    expect(listAfterDelete.status).to.equal(200);
    expect(listAfterDelete.body.data.sleepEntries).to.be.an('array').that.is
      .empty;
  });
});
