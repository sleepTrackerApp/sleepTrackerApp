/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const insigntRoutes = require('./apiInsightRoutes');
const sleepEntryRoutes = require('./apiSleepEntryRoutes');
const apiWeeklySummaryRoutes = require('./apiWeeklySummaryRoutes');
const apiScheduleRoutes = require('./apiScheduleRoutes');
const { apiControllers, apiSendMessage } = require('../controllers');
const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);

// API Namespaces
router.use('/insights', insigntRoutes);
router.use('/sleep-entries', sleepEntryRoutes);
router.use('/summary', apiWeeklySummaryRoutes);
router.use('/schedules', apiScheduleRoutes);

// Real-time message trigger
router.post('/messages/send', apiSendMessage);

// Catch-all for sunknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
