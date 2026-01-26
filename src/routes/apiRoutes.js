/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const insigntRoutes = require('./apiInsightRoutes');
const sleepEntryRoutes = require('./apiSleepEntryRoutes');
const apiWeeklySummaryRoutes = require('./apiWeeklySummaryRoutes');
const apiScheduleRoutes = require('./apiScheduleRoutes');
const apiGoalRoutes = require('./apiGoalRoutes');
const apiMessageRoutes = require('./apiMessageRoutes');
const apiInsighsRoutes = require('./apiInsighsRoutes');
const { apiControllers } = require('../controllers');
const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);

// API Namespaces
router.use('/insights', insigntRoutes);
router.use('/sleep-entries', sleepEntryRoutes);
router.use('/summary', apiWeeklySummaryRoutes);
router.use('/schedules', apiScheduleRoutes);
router.use('/goal', apiGoalRoutes);
router.use('/messages', apiMessageRoutes);
router.use('/insights', apiInsighsRoutes);

// Catch-all for unknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
