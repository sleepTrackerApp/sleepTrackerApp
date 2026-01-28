const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Goal Service', () => {
  let sandbox;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getGoal', () => {
    it('should get goal without date (uses current date)', async () => {
      const mockGoal = {
        _id: 'goal1',
        userId: mockUserId,
        goalValue: 480,
        setDate: new Date('2026-01-01'),
      };
      const mockQuery = {
        sort: sandbox.stub().returnsThis(),
        limit: sandbox.stub().resolves(mockGoal),
      };
      const GoalStub = {
        findOne: sandbox.stub().returns(mockQuery),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub().resolves({ duration: 480 }),
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      const result = await goalService.getGoal(mockUserId);

      expect(GoalStub.findOne.calledOnce).to.be.true;
      expect(SleepEntryStub.findOne.calledOnce).to.be.true;
      expect(result.goalValue).to.equal(480);
      expect(result.setDate).to.deep.equal(mockGoal.setDate);
      expect(result.duration).to.equal(480);
      expect(result.goalMet).to.equal(true);
    });

    it('should get goal for a specific date', async () => {
      const mockGoal = {
        _id: 'goal1',
        userId: mockUserId,
        goalValue: 480,
        setDate: new Date('2026-01-15'),
      };
      const mockQuery = {
        sort: sandbox.stub().returnsThis(),
        limit: sandbox.stub().resolves(mockGoal),
      };
      const GoalStub = {
        findOne: sandbox.stub().returns(mockQuery),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub().resolves({ duration: 300 }), // below goal
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      const result = await goalService.getGoal(mockUserId, '2026-01-15');

      expect(GoalStub.findOne.calledOnce).to.be.true;
      expect(SleepEntryStub.findOne.calledOnce).to.be.true;
      expect(result.goalValue).to.equal(480);
      expect(result.setDate).to.deep.equal(mockGoal.setDate);
      expect(result.duration).to.equal(300);
      expect(result.goalMet).to.equal(false);
    });

    it('should return an empty goal when no goal found', async () => {
      const mockQuery = {
        sort: sandbox.stub().returnsThis(),
        limit: sandbox.stub().resolves(null),
      };
      const GoalStub = {
        findOne: sandbox.stub().returns(mockQuery),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub().resolves(null),
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      const result = await goalService.getGoal(mockUserId, '2026-01-15');

      expect(GoalStub.findOne.calledOnce).to.be.true;
      expect(SleepEntryStub.findOne.calledOnce).to.be.true;
      expect(result.goalValue).to.equal(0);
      expect(result.setDate).to.be.null;
      expect(result.duration).to.be.null;
      expect(result.goalMet).to.be.null;
    });
  });

  describe('setGoal', () => {
    it('should set goal with correct value', async () => {
      const mockGoalDoc = {
        _id: 'goal1',
        userId: mockUserId,
        goalValue: 480,
        setDate: new Date(),
      };
      const GoalStub = {
        findOne: sandbox.stub().returns({
          sort: sandbox.stub().returnsThis(),
          limit: sandbox.stub().resolves(null), // no existing goal
        }),
        findOneAndUpdate: sandbox.stub().resolves(mockGoalDoc),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub(), // not used by setGoal
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      const result = await goalService.setGoal(mockUserId, 480);

      expect(GoalStub.findOne.calledOnce).to.be.true;
      expect(GoalStub.findOneAndUpdate.calledOnce).to.be.true;
      expect(result.goalValue).to.equal(480);
      expect(result.setDate).to.deep.equal(mockGoalDoc.setDate);
    });

    it('should throw error if value is missing', async () => {
      const GoalStub = {
        findOne: sandbox.stub(),
        findOneAndUpdate: sandbox.stub(),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub(),
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      try {
        await goalService.setGoal(mockUserId, null);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Goal value is required');
      }
    });

    it('should throw error if value exceeds max allowed duration', async () => {
      const GoalStub = {
        findOne: sandbox.stub(),
        findOneAndUpdate: sandbox.stub(),
      };
      const SleepEntryStub = {
        findOne: sandbox.stub(),
      };

      const goalService = proxyquire('../../../src/services/goalService', {
        '../models': { Goal: GoalStub, SleepEntry: SleepEntryStub },
      });

      try {
        await goalService.setGoal(mockUserId, 800); // > 775 minutes
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include(
          'Goal value must be a number between 360 (6 hours) and 775 (12 hours 55 minutes) minutes'
        );
      }
    });
  });
});
