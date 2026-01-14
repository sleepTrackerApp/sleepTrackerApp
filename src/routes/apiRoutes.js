/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const insigntRoutes = require('./apiInsightRoutes');
const sleepEntryRoutes = require('./apiSleepEntryRoutes');
const apiWeeklySummaryRoutes = require('./apiWeeklySummaryRoutes');
const { apiControllers } = require('../controllers');
const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);

// API Namespaces
router.use('/insights', insigntRoutes);
router.use('/sleep-entries', sleepEntryRoutes);
router.use('/summary', apiWeeklySummaryRoutes);

// Catch-all for sunknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
