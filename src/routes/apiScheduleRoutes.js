/**
 * Routes for the Schedule API namespace.
 */
const express = require('express');
const { scheduleController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// GET /api/schedules
router.get('/', requireAuthAPI, scheduleController.list);

// GET /api/schedules/:id
router.get('/:id', requireAuthAPI, scheduleController.getOne);

// POST /api/schedules
router.post('/', requireAuthAPI, scheduleController.create);

// PATCH /api/schedules/:id
router.patch('/:id', requireAuthAPI, scheduleController.update);

// DELETE /api/schedules/:id
router.delete('/:id', requireAuthAPI, scheduleController.remove);

// POST /api/schedules/:id/toggle
router.post('/:id/toggle', requireAuthAPI, scheduleController.toggle);

module.exports = router;
