/**
 * Service layer responsbile for interacting with Sleep Entries model. 
 *
 */

const { SleepEntry } = require("../models")

/**
 * Fetch sleep entries for a user with pagination.
 * @param user - User object
 * @param page - page number for pagination
 * @param limit - number of entries per page
 * @returns {Promise<*>} - list of sleep entries, total amount of entries and pagination info
 */
async function getSleepEntries(user, page, limit) {

    const userId = user._id;
    const skip = (page - 1) * limit;
    const result = await SleepEntry.find({ userId })
        .sort({ entryDate: -1})
        .skip(skip)
        .limit(limit);

    const totalEntries = await SleepEntry.countDocuments({ userId });
    const totalPages = Math.ceil(totalEntries / limit);

    return {
        sleepEntries: result,
        totalEntries,
        totalPages,
        currentPage: page
    }

}

module.exports = {
    getSleepEntries
};


