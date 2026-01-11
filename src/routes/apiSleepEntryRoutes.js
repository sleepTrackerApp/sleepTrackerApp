/**
 * Routes for the Sleep Entry API namespace.
 */
const express = require('express');
const { sleepEntryController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// Sleep Entry API
router.get('/', requireAuthAPI, sleepEntryController.getSleepEntries);

module.exports = router;
