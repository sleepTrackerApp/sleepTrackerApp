/**
 * Service layer responsible for Goal model functions.
 */
const { Goal, SleepEntry } = require('../models');

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
 * Always targets today's date. If a goal already exists for today, it will be updated.
 * If the new goal value is the same as the current active goal, no new record is created
 * and the existing goal (with its original setDate) is returned.
 * Valid range is 6 hours to 12h 55m (360–775 minutes).
 * @param {string} userId - ID of the user object
 * @param {number} value - goal value in minutes (sleep duration)
 * @returns {Promise<{goalValue: number, setDate: Date|null}>} - the active goal value and date
 * @throws {Error} - if validation fails
 */
async function setGoal(userId, value) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (value === undefined || value === null) {
        throw new Error('Goal value is required');
    }
    // 6h–12h55m range in minutes
    if (typeof value !== 'number' || value < 360 || value > 775) {
        throw new Error('Goal value must be a number between 360 (6 hours) and 775 (12 hours 55 minutes) minutes');
    }

    // Normalize today's date (used for creating/updating today's goal)
    const today = normalizeDate(new Date());

    // Find the current active goal (most recent on or before today)
    const currentGoalDoc = await Goal.findOne({
        userId,
        setDate: { $lte: today },
    }).sort({ setDate: -1 }).limit(1);

    // If the new value matches the current goal, do not create a new record
    if (currentGoalDoc && currentGoalDoc.goalValue === value) {
        return {
            goalValue: currentGoalDoc.goalValue,
            setDate: currentGoalDoc.setDate,
        };
    }

    // Otherwise, set or update today's goal
    const goalDoc = await Goal.findOneAndUpdate(
        { userId, setDate: today },
        {
            $setOnInsert: { userId, setDate: today },
            $set: { goalValue: value },
        },
        { new: true, upsert: true }
    );

    return {
        goalValue: goalDoc.goalValue,
        setDate: goalDoc.setDate,
    };
}

/**
 * Get a goal for a user on a specific date.
 * Returns the most recent goal set on or before the specified date.
 * If no goal is found, returns a default goal with goalValue 0 and setDate null.
 * If date is not provided, uses the current date (effectively getting the current goal).
 * @param {string} userId - ID of the user object
 * @param {Date|string} [date] - date to get the goal for (optional, defaults to today)
 * @returns {Promise<{goalValue: number, setDate: Date|null, duration: number|null, goalMet: boolean|null}>} - goal object with goalValue, setDate, duration and goalMet
 * @throws {Error} - if date is invalid
 */
async function getGoal(userId, date = null) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // Use current date if not provided
    const targetDate = date ? normalizeDate(date) : normalizeDate(new Date());

    // Fetch goal and any sleep entry for this date in parallel
    const goalQuery = Goal.findOne({
        userId,
        setDate: { $lte: targetDate }
    }).sort({ setDate: -1 }).limit(1);

    const sleepEntryQuery = SleepEntry.findOne({
        userId,
        entryDate: targetDate,
    });

    const [goal, sleepEntry] = await Promise.all([goalQuery, sleepEntryQuery]);

    const duration = sleepEntry && typeof sleepEntry.duration === 'number'
        ? sleepEntry.duration
        : null;

    // Default response when no goal is found
    if (!goal) {
        return {
            goalValue: 0,
            setDate: null,
            duration,
            // No goal and/or sleep entry - cannot determine if goal was met
            goalMet: null,
        };
    }

    let goalMet = null;
    if (duration !== null) {
        // true if user slept at least as long as the goal, false otherwise
        goalMet = duration >= goal.goalValue;
    }

    return {
        goalValue: goal.goalValue,
        setDate: goal.setDate,
        duration,
        goalMet,
    };
}

/**
 * Get a list of goals for a user within a date range.
 * Returns an entry for each date in the range with the active goal for that date.
 * The active goal for a date is the most recent goal set on or before that date.
 * @param {string} userId - ID of the user object
 * @param {Date|string} startDate - start date of the range (inclusive)
 * @param {Date|string} endDate - end date of the range (inclusive)
 * @returns {Promise<Array<{date: Date, goal: number|null, duration: number|null, goalMet: boolean|null}>>} - array of date-goal pairs, sorted by date
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

    // Get all sleep entries in the range so we can check if goals were met
    const sleepEntries = await SleepEntry.find({
        userId,
        entryDate: {
            $gte: normalizedStart,
            $lte: normalizedEnd,
        },
    }).sort({ entryDate: 1 });

    // Map entryDate (midnight) to sleep entry for quick lookup
    const sleepEntryByDate = new Map();
    for (const entry of sleepEntries) {
        if (entry.entryDate instanceof Date) {
            sleepEntryByDate.set(entry.entryDate.getTime(), entry);
        }
    }

    // Generate all dates in the range
    const result = [];
    const currentDate = new Date(normalizedStart);

    while (currentDate <= normalizedEnd) {
        const dateCopy = new Date(currentDate);

        // Find the most recent goal on or before this date
        const activeGoal = goals.find(goal => goal.setDate <= dateCopy);
        const goalValue = activeGoal ? activeGoal.goalValue : null;

        const key = dateCopy.getTime();
        const entry = sleepEntryByDate.get(key);
        const duration = entry && typeof entry.duration === 'number'
            ? entry.duration
            : null;

        let goalMet = null;
        if (goalValue !== null && duration !== null) {
            goalMet = duration >= goalValue;
        }

        result.push({
            date: new Date(dateCopy),
            goal: goalValue,
            duration,
            goalMet,
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
