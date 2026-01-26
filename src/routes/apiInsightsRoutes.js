const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const { requireAuthAPI } = require('../helpers/auth');

// AI daily insight endpoint
router.get('/', requireAuthAPI, insightsController.getDailyInsight);

module.exports = router;
