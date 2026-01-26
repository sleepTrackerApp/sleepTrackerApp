const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuthAPI } = require('../helpers/auth');

// Define the endpoint for getting daily insights
router.get('/', requireAuthAPI, aiController.getDailyInsight);

module.exports = router;
