/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const apiArticleRoutes = require('./apiArticleRoutes');
const sleepEntryRoutes = require('./apiSleepEntryRoutes');
const apiWeeklySummaryRoutes = require('./apiWeeklySummaryRoutes');
const apiScheduleRoutes = require('./apiScheduleRoutes');
const apiGoalRoutes = require('./apiGoalRoutes');
const apiMessageRoutes = require('./apiMessageRoutes');
const apiInsightsRoutes = require('./apiInsightsRoutes');
const { apiControllers } = require('../controllers');
const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);

// API Namespaces
router.use('/articles', apiArticleRoutes);
router.use('/sleep-entries', sleepEntryRoutes);
router.use('/summary', apiWeeklySummaryRoutes);
router.use('/schedules', apiScheduleRoutes);
router.use('/goal', apiGoalRoutes);
router.use('/messages', apiMessageRoutes);
router.use('/insights', apiInsightsRoutes);

// Catch-all for unknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
