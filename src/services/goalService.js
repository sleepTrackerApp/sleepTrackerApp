/**
 * Service layer responsible for Goal model functions.
 */
const { Goal } = require('../models');

/**
 * Normalize a date to midnight (start of day).
 * @param {Date|string} date - date to normalize
 * @returns {Date} - normalized Date object at midnight
 * @throws {Error} - if date is invalid
 */
function normalizeDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format');
    }
    const normalized = new Date(dateObj);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

/**
 * Set or update a goal for a user.
 * Always sets the goal for today's date. If a goal already exists for today, it will be updated.
 * @param {string} userId - ID of the user object
 * @param {number} value - goal value in minutes (sleep duration)
 * @returns {Promise<import('mongoose').Document>} - the goal document
 * @throws {Error} - if validation fails
 */
async function setGoal(userId, value) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (value === undefined || value === null) {
        throw new Error('Goal value is required');
    }
    if (typeof value !== 'number' || value < 0 || value > 1440) {
        throw new Error('Goal value must be a number between 0 and 1440 minutes');
    }

    // Always use today's date
    const goalDate = normalizeDate(new Date());

    // Use findOneAndUpdate with upsert to create or update
    return Goal.findOneAndUpdate(
        { userId, setDate: goalDate },
        {
            $setOnInsert: { userId, setDate: goalDate },
            $set: { goalValue: value },
        },
        { new: true, upsert: true }
    );
}

/**
 * Get a goal for a user on a specific date.
 * Returns the most recent goal set on or before the specified date.
 * If no goal is found, returns a default goal with goalValue 0 and setDate null.
 * If date is not provided, uses the current date (effectively getting the current goal).
 * @param {string} userId - ID of the user object
 * @param {Date|string} [date] - date to get the goal for (optional, defaults to today)
 * @returns {Promise<{goalValue: number, setDate: Date|null}>} - goal object with goalValue and setDate
 * @throws {Error} - if date is invalid
 */
async function getGoal(userId, date = null) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // Use current date if not provided
    const targetDate = date ? normalizeDate(date) : normalizeDate(new Date());
    
    // Get the most recent goal on or before this date
    const goal = await Goal.findOne({
        userId,
        setDate: { $lte: targetDate }
    }).sort({ setDate: -1 }).limit(1);

    // Return default goal if none found
    if (!goal) {
        return {
            goalValue: 0,
            setDate: null
        };
    }

    return {
        goalValue: goal.goalValue,
        setDate: goal.setDate
    };
}

/**
 * Get a list of goals for a user within a date range.
 * Returns an entry for each date in the range with the active goal for that date.
 * The active goal for a date is the most recent goal set on or before that date.
 * @param {string} userId - ID of the user object
 * @param {Date|string} startDate - start date of the range (inclusive)
 * @param {Date|string} endDate - end date of the range (inclusive)
 * @returns {Promise<Array<{date: Date, goal: number|null}>>} - array of date-goal pairs, sorted by date
 * @throws {Error} - if dates are invalid or startDate > endDate
 */
async function getGoalsInRange(userId, startDate, endDate) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
    }

    const normalizedStart = normalizeDate(startDate);
    const normalizedEnd = normalizeDate(endDate);

    if (normalizedStart > normalizedEnd) {
        throw new Error('Start date must be before or equal to end date');
    }

    // Get all goals for the user up to the end date, sorted by date descending
    // This allows us to find the most recent goal for each date
    const goals = await Goal.find({
        userId,
        setDate: {
            $lte: normalizedEnd,
        },
    }).sort({ setDate: -1 }); // Sort descending to get most recent first

    // Generate all dates in the range
    const result = [];
    const currentDate = new Date(normalizedStart);
    
    while (currentDate <= normalizedEnd) {
        const dateCopy = new Date(currentDate);
        
        // Find the most recent goal on or before this date
        const activeGoal = goals.find(goal => goal.setDate <= dateCopy);
        
        result.push({
            date: new Date(dateCopy),
            goal: activeGoal ? activeGoal.goalValue : null,
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
}

module.exports = {
    setGoal,
    getGoal,
    getGoalsInRange,
};
