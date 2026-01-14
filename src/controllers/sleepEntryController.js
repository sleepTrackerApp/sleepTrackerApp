/**
 * Sleep Entries Controller
 *
 */
const { sleepEntryService } = require("../services")

async function getSleepEntries(req, res, next) {
  try {

    const user = res.locals.userRecord;

    const limit = parseInt(req.query.limit) || 50;

    const page = parseInt(req.query.page) || 1;

    const entries = await sleepEntryService.getSleepEntries(user, page, limit);
    res.status(200).json({
      success: true,
      data: entries,
      
    });
  } catch (error) {
      next(error)
  }
}

module.exports = {
  getSleepEntries,
}


