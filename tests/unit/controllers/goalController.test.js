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
                userRecord: { _id: mockUserId }
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
                _id: 'goal1',
                goalValue: 480,
                setDate: new Date('2024-01-01'),
            };
            req.params.date = '2024-01-15';

            sinon.stub(goalService, 'getGoal').resolves(mockGoal);

            await goalController.getGoal(req, res, next);

            expect(goalService.getGoal.calledOnceWith(mockUserId, '2024-01-15')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                success: true,
                data: {
                    goalValue: mockGoal.goalValue,
                    setDate: mockGoal.setDate
                }
            })).to.be.true;
        });

        it('should return empty goal when no goal found', async () => {
            req.params.date = '2024-01-15';
            sinon.stub(goalService, 'getGoal').resolves({ goalValue: 0, setDate: null });

            await goalController.getGoal(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                success: true,
                data: {
                    goalValue: 0,
                    setDate: null
                }
            })).to.be.true;
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
            expect(res.json.calledWith({
                success: true,
                data: {
                    goalValue: mockGoal.goalValue,
                    setDate: mockGoal.setDate
                },
                message: 'Goal set successfully'
            })).to.be.true;
        });

        it('should return 400 on validation error', async () => {
            req.body = { value: 1500 };
            const validationError = new Error('Goal value must be a number between 0 and 1440 minutes');

            sinon.stub(goalService, 'setGoal').rejects(validationError);

            await goalController.setGoal(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Goal value must be a number between 0 and 1440 minutes'
                }
            })).to.be.true;
        });
    });
});
