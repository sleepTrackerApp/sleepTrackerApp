/**
 * Routes for the Goal API namespace.
 */
const express = require('express');
const { goalController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// Goal API
// GET /api/goal/progress - Get aggregated goal progress for the current month
router.get('/progress', requireAuthAPI, goalController.getGoalProgressMonth);

// GET /api/goal/ - Get the current (most recent) goal for the user
// GET /api/goal/:date - Get goal for a specific date (returns most recent goal on or before that date)
router.get('/:date?', requireAuthAPI, goalController.getGoal);

// POST /api/goal - Set or update a goal for the user
// Body: { value: number }
router.post('/', requireAuthAPI, goalController.setGoal);

module.exports = router;
