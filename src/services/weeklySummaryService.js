/**
 * Service layer responsbile for interacting with Sleep Entries model.
 *
 */

const {Summary, SleepEntry} = require("../models");

/**
 * Fetch weekly summary entries for a user with pagination.
 * @param user - User object
 * @param page - page number for pagination (default is 1)
 * @param limit - number of entries per page (default is 10)
 * @returns {Promise<*>} - list of weekly summary entries, total amount of entries and pagination info
 */
async function getAllWeeklySummary(user, page = 1, limit = 10){
    const userId = user._id;
    const skip = (page - 1) * limit;

    const result = await Summary.find({ userId })
        .sort({ entryDate: -1})
        .skip(skip)
        .limit(limit);

    const totalEntries = await Summary.countDocuments({ userId });
    const totalPages = Math.ceil(totalEntries / limit);

    return {
        summaryEntries: result,
        totalEntries,
        totalPages,
        currentPage: page
    }
}

/**
 * Create a weekly summary for the user based on their sleep entries.
 * @param user - User object
 * @param summaryDate - Date to base the week on (defaults to current date)
 * @returns {Promise<*>} - created or updated weekly summary entry
 */
async function createWeeklySummary(user, summaryDate = new Date()) {
    const userId = user._id;
    // Find the dates for Monday and Sunday of the previous week according to summaryDate

    const weekDay = summaryDate.getDay(); // 0 (Sun) to 6 (Sat)
    const daysSinceMonday = (weekDay + 6) % 7;
    const startOfWeek = new Date(summaryDate);
    startOfWeek.setDate(summaryDate.getDate() - daysSinceMonday - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyEntries = await SleepEntry.find({
        userId,
        entryDate: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const totalHours = weeklyEntries.reduce((sum, e) => sum + e.hours, 0);
    const avgHours = totalHours / weeklyEntries.length;

    // Updare or create summary entry
    return Summary.findOneAndUpdate(
        {userId, endryDate: endOfWeek},
        {avgHours, endryDate: endOfWeek},
        {new: true, upsert: true}
    );
}

module.exports = {
    getAllWeeklySummary,
    createWeeklySummary,
};

