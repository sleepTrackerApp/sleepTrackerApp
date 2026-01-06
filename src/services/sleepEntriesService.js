/**
 * Service layer responsbile for interacting with Sleep Entries model. 
 *
 */

const sleepEntry = require("../models/sleepEntries")

async function getAllSleepEntries(userId) {
    const hundredLimit = 100;

    return await sleepEntry.find({ userId })
        .sort({ entryDate: -1})
        .limit(hundredLimit);
}

module.exports = {
    getAllSleepEntries
};


