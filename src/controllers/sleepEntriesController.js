/**
 * Sleep Entries Controller
 *
 */

const sleepEntriesService = require("../services/sleepEntriesService");

async function getSleepEntries(req, res) {
  try {
    const userId = req.user._id;

    const limit = parseInt(req.query.limit) || 50;

    const entries = await sleepEntriesService.getAllSleepEntries(userId);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching sleep entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to Fetch",
    });
  }
}

module.exports = {
  getSleepEntries,
};


