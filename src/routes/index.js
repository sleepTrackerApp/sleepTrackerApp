/**
 * This module aggregates all route handlers for the application.
 */

const express = require('express');
const homeRoutes = require('./homeRoutes');

// Create a new router instance
const router = express.Router();

// Mount route handlers
router.use('/', homeRoutes);

module.exports = router;

