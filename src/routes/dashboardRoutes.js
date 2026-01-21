/**
 * Routes for dashboard pages.
 */

const express = require('express');
const { dashboardControllers } = require('../controllers');
const { requireAuthRoute } = require('../helpers/auth');

const router = express.Router();

router.get('/', requireAuthRoute, dashboardControllers.renderDashboard);

router.get('/schedules', requireAuthRoute, dashboardControllers.renderSchedules);

module.exports = router;

