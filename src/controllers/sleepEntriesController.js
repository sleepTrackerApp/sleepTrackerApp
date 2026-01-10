/**
 * Sleep Entries Controller
 *
 */
const { sleepEntriesService } = require("../services")

async function getSleepEntries(req, res, next) {
  try {
    const user = res.locals.userRecords 
    
    const limit = parseInt(req.query.limit) || 50;

    const entries = await sleepEntriesService.getAllSleepEntries(user);
    res.status(200).json({
      success: true,
      count: entries?.length ?? 0,
      data: entries,
      
    });
  } catch (error) {
      next(error)
  }
};

module.exports = {
  getSleepEntries,
};


