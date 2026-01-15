/**
 * Routes for the Sleep Entry API namespace.
 */
const express = require('express');
const { sleepEntryController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// Sleep Entry API
// GET /api/sleep-entries - Get sleep entries with pagination and optional date range
// Query params: page, limit, startDate, endDate (ISO date strings, optional)
router.get('/', requireAuthAPI, sleepEntryController.getSleepEntries);

// GET /api/sleep-entries/:date - Get a single sleep entry by date
router.get('/:date', requireAuthAPI, sleepEntryController.getSleepEntryByDate);

// POST /api/sleep-entries - Create or update a sleep entry
// Body: entryTime, duration, startTime, endTime, rating
router.post('/', requireAuthAPI, sleepEntryController.createOrUpdateSleepEntry);

// DELETE /api/sleep-entries/:date - Delete a sleep entry by date
router.delete('/:date', requireAuthAPI, sleepEntryController.deleteSleepEntry);

module.exports = router;
