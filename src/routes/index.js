/**
 * This module aggregates all route handlers for the application.
 */

const express = require('express');

// Import route handlers
const homeRoutes = require('./homeRoutes');
const apiRoutes = require('./apiRoutes');

// Create a new router instance
const router = express.Router();

// Mount route handlers
router.use('/', homeRoutes);
router.use('/api', apiRoutes);

module.exports = router;

