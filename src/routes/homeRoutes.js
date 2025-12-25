/**
  * This module defines the routes for the home page.
 */
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { appName: 'Alive Sleep Tracker App' });
});

module.exports = router;

