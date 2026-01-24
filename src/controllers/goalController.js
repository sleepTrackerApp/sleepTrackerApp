/**
 * Goal Controller
 * Handles HTTP requests for goal-related operations.
 */
const { goalService } = require('../services');

/**
 * Helper to format minutes as a human-friendly hours string, e.g. "8 hours" or "7 hours 30 minutes".
 * @param {number} minutes
 * @returns {string}
 */
function formatMinutesToHoursText(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours} hours`;
    }
    return `${hours} hours ${mins} minutes`;
}

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

/**
 * Get aggregated goal progress for the current month.
 * Uses the goalService.getGoalsInRange data to compute:
 * - nightsMetGoal / nightsTotalWithGoal (for circular gauge)
 * - monthly average sleep duration and label
 * - projected success percentage
 * - a summary message
 * GET /api/goal/progress
 */
async function getGoalProgressMonth(req, res, next) {
    try {
        const userId = res.locals.userRecord._id;

        const today = new Date();
        // Determine which month to report on:
        // - On the 1st, use the previous calendar month
        // - From the 2nd onwards, use the current month
        let year = today.getFullYear();
        let monthIndex = today.getMonth(); // 0-based

        if (today.getDate() === 1) {
            monthIndex -= 1;
            if (monthIndex < 0) {
                monthIndex = 11;
                year -= 1;
            }
        }

        const firstOfMonth = new Date(year, monthIndex, 1);
        const lastOfMonth = new Date(year, monthIndex + 1, 0);

        const [range, currentGoal] = await Promise.all([
            goalService.getGoalsInRange(userId, firstOfMonth, lastOfMonth),
            goalService.getGoal(userId),
        ]);

        // Days with any recorded sleep duration (regardless of goal)
        const daysWithData = range.filter(day => day.duration !== null && typeof day.duration === 'number');

        // Days where both a goal and sleep duration exist
        const daysWithGoalAndData = range.filter(day =>
            day.goal !== null &&
            day.duration !== null &&
            typeof day.duration === 'number'
        );

        const successfulDays = daysWithGoalAndData.filter(day => day.goalMet === true);

        const totalDurationMinutes = daysWithData.reduce(
            (sum, day) => sum + (day.duration || 0),
            0
        );
        const averageDurationMinutes = daysWithData.length > 0
            ? Math.round(totalDurationMinutes / daysWithData.length)
            : null;

        const projectedSuccessPercent = daysWithGoalAndData.length > 0
            ? Math.round((successfulDays.length / daysWithGoalAndData.length) * 100)
            : null;

        const currentGoalMinutes =
            currentGoal && typeof currentGoal.goalValue === 'number' && currentGoal.goalValue > 0
                ? currentGoal.goalValue
                : null;

        let averageLabel = null;
        if (averageDurationMinutes !== null && currentGoalMinutes !== null) {
            averageLabel = averageDurationMinutes >= currentGoalMinutes
                ? 'Great job!'
                : 'Needs Improvement';
        }

        const hasAnyData = daysWithData.length > 0;
        const allGoalNightsMet =
            daysWithGoalAndData.length > 0 &&
            successfulDays.length === daysWithGoalAndData.length;
        let summaryMessage;

        if (!hasAnyData) {
            summaryMessage = 'Please record at least one night to see your progress.';
        } else if (!currentGoalMinutes) {
            summaryMessage = 'You are logging your sleep. Set a nightly goal to track your progress.';
        } else {
            const successRate = projectedSuccessPercent || 0;
            if (allGoalNightsMet) {
                summaryMessage = 'Congratulations on meeting your sleep goal this month!';
            } else if (successRate >= 70 && averageDurationMinutes !== null && averageDurationMinutes >= currentGoalMinutes) {
                summaryMessage = 'You are on track to meet this month\'s goal. Great job!';
            } else {
                summaryMessage = `Keep pushing to meet your goal of ${formatMinutesToHoursText(currentGoalMinutes)} of sleep per night!`;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                month: {
                    year: firstOfMonth.getFullYear(),
                    month: firstOfMonth.getMonth() + 1,
                    startDate: firstOfMonth,
                    endDate: lastOfMonth,
                    totalDays: range.length,
                },
                stats: {
                    nightsMetGoal: successfulDays.length,
                    nightsTotalWithGoal: daysWithGoalAndData.length,
                    nightsWithData: daysWithData.length,
                    averageDurationMinutes,
                    projectedSuccessPercent,
                    averageLabel,
                    summaryMessage,
                },
                daily: range,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGoal,
    setGoal,
    getGoalProgressMonth,
};
