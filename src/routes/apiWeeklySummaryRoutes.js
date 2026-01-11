/**
 * Routes for the Weekly Summary API namespace.
 */
const express = require('express');
const { weeklySummaryController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// Sleep Entry API
router.get('/', requireAuthAPI, weeklySummaryController.getWeeklySummary);
router.post('/', requireAuthAPI, weeklySummaryController.createWeeklySummary);

module.exports = router;
