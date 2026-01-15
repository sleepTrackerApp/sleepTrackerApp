/**
 * This module aggregates all route handlers for the application.
 */

const express = require('express');

// Import route handlers
const homeRoutes = require('./homeRoutes');
const apiRoutes = require('./apiRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('./authRoutes');
const sleepRoutes = require('./sleepRoutes');

// Create a new router instance
const router = express.Router();

// Mount route handlers
router.use('/', homeRoutes);
router.use('/api', apiRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/recordsleep', sleepRoutes);

module.exports = router;

