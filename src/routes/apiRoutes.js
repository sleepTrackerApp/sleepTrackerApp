/**
 * Routes for the REST API namespace.
 */
const express = require('express');
const { apiControllers, insightControllers, sleepEntriesController } = require('../controllers');

const router = express.Router();

// Base welcome endpoint
router.get('/', apiControllers.apiWelcome);
router.get('/insights', insightControllers.getInsights);

// Sleep Entry API
router.route("/sleep-entries")
    .get(sleepEntriesController.getSleepEntries);

// Catch-all for unknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
