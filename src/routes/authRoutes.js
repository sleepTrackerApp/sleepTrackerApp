/**
 * Auth-related routes for login and logout redirects.
 */

const express = require('express');
const { authControllers } = require('../controllers');

const router = express.Router();

router.get('/login', authControllers.login);
router.get('/logout', authControllers.logout);

module.exports = router;

