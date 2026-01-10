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
<<<<<<< HEAD
router.route("/sleep-entries")
    .get(sleepEntriesController.getSleepEntries);
=======
router.get("/getSleepEntries", sleepEntriesController.getSleepEntries);
>>>>>>> refs/remotes/origin/feature/US6-1-1-Fetch-a-list-of-sleep-entries

// Catch-all for unknown API routes
router.use(apiControllers.apiNotFound);
router.use(apiControllers.apiError);

module.exports = router;
