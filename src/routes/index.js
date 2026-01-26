/**
 * This module aggregates all route handlers for the application.
 */

const express = require('express');

// Import route handlers
const homeRoutes = require('./homeRoutes');
const apiRoutes = require('./apiRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('./authRoutes');
const diagnosticsRoutes = require('./diagnosticsRoutes');
const messageRoutes = require('./messageRoutes');
const profileRoutes = require('./profileRoutes');
const aiRoutes = require('./aiRoutes');

// Create a new router instance
const router = express.Router();

// Mount route handlers
router.use('/', homeRoutes);
router.use('/api/ai', aiRoutes);
router.use('/api', apiRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/profile', profileRoutes);
router.use('/diagnostics', diagnosticsRoutes);

module.exports = router;
