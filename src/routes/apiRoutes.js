/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const { apiControllers, insightControllers, sleepEntriesController, weeklySummaryController } = require('../controllers');

const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);
router.get('/insights', insightControllers.getInsights);

// Sleep Entry API
router.get("/getSleepEntries", sleepEntriesController.getSleepEntries);

// Weekly Summary API
router.get("/getWeeklySummary", weeklySummaryController.getWeeklySummary);

// Catch-all for unknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
