const { expect } = require('chai');
const sinon = require('sinon');

const {
  getWeeklySummary,
  createWeeklySummary,
} = require('../../../src/controllers/weeklySummaryController');
const { userService, weeklySummaryService } = require('../../../src/services');

describe('Weekly summary data controller tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('pull weekly summary data correctly', async () => {
    const req = {
      query: {},
    };

    const res = {
      locals: {
        userRecord: { _id: 'auth0|123' },
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const falseEntries = {
      summaryEntries: [
        {
          _id: '701111111111111111111111',
          userId: '1',
          date: new Date('2026-01-01T22:30:00Z'),
          avgHours: 25,
        },
        {
          _id: '702222222222222222222222',
          userId: '1',
          date: new Date('2026-01-02T23:00:00Z'),
          avgHours: 19,
        },
      ],
      totalEntries: 2,
      totalPages: 1,
      currentPage: 1,
    };

    sinon.stub(userService, 'findUserByAuthId').resolves({});
    sinon
      .stub(weeklySummaryService, 'getAllWeeklySummary')
      .resolves(falseEntries);

    await getWeeklySummary(req, res);

    expect(res.status.calledOnceWithExactly(200)).to.be.true;
    expect(
      res.json.calledOnceWithExactly({
        success: true,
        data: falseEntries,
      })
    ).to.be.true;
  });

  it('creates weekly summary data and inputs into model correclty', async () => {
    const req = {
      query: {},
    };

    const res = {
      locals: {
        userRecord: { _id: 'auth0|123' },
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const falseEntry = {
      _id: '701111111111111111111111',
      userId: '1',
      date: new Date('2026-01-01T22:30:00Z'),
      avgHours: 25,
    };

    sinon.stub(userService, 'findUserByAuthId').resolves({});
    sinon
      .stub(weeklySummaryService, 'createWeeklySummary')
      .resolves(falseEntry);

    await createWeeklySummary(req, res);

    expect(res.status.calledOnceWithExactly(200)).to.be.true;
    expect(
      res.json.calledOnceWithExactly({
        success: true,
        data: falseEntry,
      })
    ).to.be.true;
  });
});
