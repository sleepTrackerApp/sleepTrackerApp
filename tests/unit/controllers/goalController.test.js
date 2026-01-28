const { expect } = require('chai');
const sinon = require('sinon');
const { goalController } = require('../../../src/controllers');
const { goalService } = require('../../../src/services');

describe('Goal Controller', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      locals: {
        userRecord: { _id: mockUserId },
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getGoal', () => {
    it('should return goal', async () => {
      const mockGoal = {
        goalValue: 480,
        setDate: new Date('2026-01-01'),
      };
      req.params.date = '2026-01-15';

      sinon.stub(goalService, 'getGoal').resolves(mockGoal);

      await goalController.getGoal(req, res, next);

      expect(goalService.getGoal.calledOnceWith(mockUserId, '2026-01-15')).to.be
        .true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          success: true,
          data: {
            goalValue: mockGoal.goalValue,
            setDate: mockGoal.setDate,
          },
        })
      ).to.be.true;
    });

    it('should return default goal when no goal found', async () => {
      req.params.date = '2026-01-15';
      sinon
        .stub(goalService, 'getGoal')
        .resolves({ goalValue: 0, setDate: null });

      await goalController.getGoal(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          success: true,
          data: {
            goalValue: 0,
            setDate: null,
          },
        })
      ).to.be.true;
    });
  });

  describe('getGoalProgressMonth', () => {
    it('should return aggregated monthly progress', async () => {
      const mockRange = [
        // Day 1: goal + duration, met
        {
          date: new Date('2026-01-01'),
          goal: 480,
          duration: 480,
          goalMet: true,
        },
        // Day 2: goal + duration, not met
        {
          date: new Date('2026-01-02'),
          goal: 480,
          duration: 300,
          goalMet: false,
        },
        // Day 3: duration only, no goal
        {
          date: new Date('2026-01-03'),
          goal: null,
          duration: 420,
          goalMet: null,
        },
      ];

      const mockGoalToday = {
        goalValue: 480,
        setDate: new Date('2025-01-01'),
        duration: null,
        goalMet: null,
      };

      sinon.stub(goalService, 'getGoalsInRange').resolves(mockRange);
      sinon.stub(goalService, 'getGoal').resolves(mockGoalToday);

      await goalController.getGoalProgressMonth(req, res, next);

      expect(goalService.getGoalsInRange.calledOnce).to.be.true;
      expect(goalService.getGoal.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;

      const jsonArg = res.json.firstCall.args[0];
      expect(jsonArg.success).to.be.true;
      expect(jsonArg.data.stats.nightsMetGoal).to.equal(1);
      expect(jsonArg.data.stats.nightsTotalWithGoal).to.equal(2);
      expect(jsonArg.data.stats.nightsWithData).to.equal(3);
      expect(jsonArg.data.stats.averageDurationMinutes).to.equal(
        Math.round((480 + 300 + 420) / 3)
      );
      expect(jsonArg.data.stats.projectedSuccessPercent).to.equal(
        Math.round((1 / 2) * 100)
      );
      expect(jsonArg.data.stats.summaryMessage).to.be.a('string');
    });
  });

  describe('setGoal', () => {
    it('should set goal with correct value', async () => {
      const mockGoal = {
        _id: 'goal1',
        goalValue: 480,
        setDate: new Date(),
      };
      req.body = { value: 480 };

      sinon.stub(goalService, 'setGoal').resolves(mockGoal);

      await goalController.setGoal(req, res, next);

      expect(goalService.setGoal.calledOnceWith(mockUserId, 480)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          success: true,
          data: {
            goalValue: mockGoal.goalValue,
            setDate: mockGoal.setDate,
          },
          message: 'Goal set successfully',
        })
      ).to.be.true;
    });

    it('should return 400 on validation error', async () => {
      req.body = { value: 1500 };
      const validationError = new Error(
        'Goal value must be a number between 360 (6 hours) and 775 (12 hours 55 minutes) minutes'
      );

      sinon.stub(goalService, 'setGoal').rejects(validationError);

      await goalController.setGoal(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWith({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'Goal value must be a number between 360 (6 hours) and 775 (12 hours 55 minutes) minutes',
          },
        })
      ).to.be.true;
    });
  });
});
