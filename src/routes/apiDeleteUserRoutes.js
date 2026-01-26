/**
 * Routes for the delete all user and user data API namespace
 */
const express = require('express');
const { deleteUserController } = require('../controllers');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

// GET /api/ - delete all user data
router.delete('/', requireAuthAPI, deleteUserController.deleteAllUserData) 

module.exports = router;
