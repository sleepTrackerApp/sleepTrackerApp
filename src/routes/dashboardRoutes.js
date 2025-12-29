/**
 * Routes for dashboard pages.
 */

const express = require('express');
const { dashboardControllers } = require('../controllers');

const router = express.Router();

router.get('/', dashboardControllers.renderDashboard);

module.exports = router;

