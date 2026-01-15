/**
 * Sleep Entries Controller
 *
 */
const { sleepEntryService } = require("../services")

/**
 * Get sleep entries for a user with pagination and optional date range filtering.
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: entries per page (default: 50)
 * - startDate: optional start date for filtering (ISO date string)
 * - endDate: optional end date for filtering (ISO date string)
 */
async function getSleepEntries(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const entries = await sleepEntryService.getSleepEntries(userId, page, limit, startDate, endDate);
    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single sleep entry by date for a user.
 * Query parameters:
 * - date: date of the sleep entry (ISO date string)
 */
async function getSleepEntryByDate(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const entryDate = req.params.date;

    if (!entryDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Date parameter is required'
        }
      });
    }

    const entry = await sleepEntryService.getSleepEntryByDate(userId, entryDate);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sleep entry not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update a sleep entry for a user.
 * Request body should contain:
 * - entryTime: date for the sleep entry (required)
 * - duration: total minutes slept (optional, if startTime/endTime provided)
 * - startTime: date-time when sleep started (optional, must be with endTime)
 * - endTime: date-time when sleep ended (optional, must be with startTime)
 * - rating: sleep quality rating 0-10 (optional)
 */
async function createOrUpdateSleepEntry(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const entryData = req.body;

    const entry = await sleepEntryService.getOrCreateSleepEntry(userId, entryData);
    
    res.status(200).json({
      success: true,
      data: entry,
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
 * Delete a sleep entry by date for a user.
 * Query parameters:
 * - date: date of the sleep entry (ISO date string)
 */
async function deleteSleepEntry(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const entryDate = req.params.date;

    if (!entryDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Date parameter is required'
        }
      });
    }

    const deletedEntry = await sleepEntryService.deleteSleepEntryByDate(userId, entryDate);
    
    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sleep entry not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: deletedEntry,
      message: 'Sleep entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSleepEntries,
  getSleepEntryByDate,
  createOrUpdateSleepEntry,
  deleteSleepEntry,
}


