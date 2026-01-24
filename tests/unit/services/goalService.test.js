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
                setDate: new Date('2024-01-01'),
            };
            const mockQuery = {
                sort: sandbox.stub().returnsThis(),
                limit: sandbox.stub().resolves(mockGoal),
            };
            const GoalStub = {
                findOne: sandbox.stub().returns(mockQuery),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            const result = await goalService.getGoal(mockUserId);

            expect(GoalStub.findOne.calledOnce).to.be.true;
            expect(result.goalValue).to.equal(480);
            expect(result.setDate).to.deep.equal(mockGoal.setDate);
        });

        it('should get goal for a specific date', async () => {
            const mockGoal = {
                _id: 'goal1',
                userId: mockUserId,
                goalValue: 480,
                setDate: new Date('2024-01-15'),
            };
            const mockQuery = {
                sort: sandbox.stub().returnsThis(),
                limit: sandbox.stub().resolves(mockGoal),
            };
            const GoalStub = {
                findOne: sandbox.stub().returns(mockQuery),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            const result = await goalService.getGoal(mockUserId, '2024-01-15');

            expect(GoalStub.findOne.calledOnce).to.be.true;
            expect(result.goalValue).to.equal(480);
            expect(result.setDate).to.deep.equal(mockGoal.setDate);
        });

        it('should return an empty goal when no goal found', async () => {
            const mockQuery = {
                sort: sandbox.stub().returnsThis(),
                limit: sandbox.stub().resolves(null),
            };
            const GoalStub = {
                findOne: sandbox.stub().returns(mockQuery),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            const result = await goalService.getGoal(mockUserId, '2024-01-15');

            expect(GoalStub.findOne.calledOnce).to.be.true;
            expect(result.goalValue).to.equal(0);
            expect(result.setDate).to.be.null;
        });
    });

    describe('setGoal', () => {
        it('should set goal with correct value', async () => {
            const mockGoal = {
                _id: 'goal1',
                userId: mockUserId,
                goalValue: 480,
                setDate: new Date(),
            };
            const GoalStub = {
                findOneAndUpdate: sandbox.stub().resolves(mockGoal),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            const result = await goalService.setGoal(mockUserId, 480);

            expect(GoalStub.findOneAndUpdate.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockGoal);
        });

        it('should throw error if value is missing', async () => {
            const GoalStub = {
                findOneAndUpdate: sandbox.stub(),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            try {
                await goalService.setGoal(mockUserId, null);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Goal value is required');
            }
        });

        it('should throw error if value exceeds 1440 minutes', async () => {
            const GoalStub = {
                findOneAndUpdate: sandbox.stub(),
            };

            const goalService = proxyquire('../../../src/services/goalService', {
                '../models': { Goal: GoalStub },
            });

            try {
                await goalService.setGoal(mockUserId, 1500);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Goal value must be a number between 0 and 1440 minutes');
            }
        });
    });
});
