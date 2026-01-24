/**
 * Goal Controller
 * Handles HTTP requests for goal-related operations.
 */
const { goalService } = require('../services');

/**
 * Get a goal for a user.
 * Returns the most recent goal set on or before the specified date.
 * If date is not provided in params, uses current date (effectively getting the current goal).
 * GET /api/goal/ or GET /api/goal/:date
 */
async function getGoal(req, res, next) {
    try {
        const userId = res.locals.userRecord._id;
        const date = req.params.date || null;

        const goal = await goalService.getGoal(userId, date);

        res.status(200).json({
            success: true,
            data: {
                goalValue: goal.goalValue,
                setDate: goal.setDate
            }
        });
    } catch (error) {
        // Handle validation errors
        if (error.message && error.message.includes('Invalid date')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid date format'
                }
            });
        }
        next(error);
    }
}

/**
 * Set or update a goal for a user.
 * POST /api/goal
 * Request body:
 * - value: goal value in minutes (required)
 */
async function setGoal(req, res, next) {
    try {
        const userId = res.locals.userRecord._id;
        const { value } = req.body;

        if (value === undefined || value === null) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Goal value is required'
                }
            });
        }

        const goal = await goalService.setGoal(userId, value);

        res.status(200).json({
            success: true,
            data: {
                goalValue: goal.goalValue,
                setDate: goal.setDate
            },
            message: 'Goal set successfully'
        });
    } catch (error) {
        // Handle validation errors
        if (error.message) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            });
        }
        next(error);
    }
}

module.exports = {
    getGoal,
    setGoal,
};
