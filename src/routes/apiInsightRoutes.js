/**
 * Routes for the Insights API namespace.
 */
const express = require('express');
const { insightControllers } = require('../controllers');

const router = express.Router();

// Insights API
router.get('/', insightControllers.getInsights);

module.exports = router;
