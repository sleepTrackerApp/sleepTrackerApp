/**
 * Service layer responsbile for interacting with Sleep Entries model. 
 *
 */

const summary = require("../models/Summary")
const sleepEntriesService = require("./sleepEntriesService")

// Get all weekly summary entries from model.
async function getAllWeeklySummary(userId){
    return await summary.find({ userId })
}


async function createWeeklySummary(userId) {
    const entries = await sleepEntriesService.getAllSleepEntries(userId);
    if(!entries.length) return null;

    const today = new Date()
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const weeklyEntries = entries.filter(entry => {
        const entryDate = new Date(entry.entryDate);
        return entryDate >= startDate && entryDate <= today;
    });

    if (!weeklyEntries.length) return null;

    const totalHours = weeklyEntries.reduce((sum, e) => sum + e.hours, 0);
    const avgHours = totalHours / weeklyEntries.length;

    const summary = await summary.findOneAndUpdate(
        { userId, date: today },
        { userId, date: today, avgHours },
        { upsert: true, new: true }
    );

    return summary;
}

module.exports = {
    getAllWeeklySummary,
    createWeeklySummary,
};

