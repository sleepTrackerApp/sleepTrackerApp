/**
 * Routes for the articles API namespace (Contentful CMS).
 */
const express = require('express');
const { articleControllers } = require('../controllers');

const router = express.Router();

// Articles API
router.get('/', articleControllers.getArticles);

module.exports = router;
