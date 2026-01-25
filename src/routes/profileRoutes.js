const express = require('express');
const { requireAuthRoute } = require('../helpers/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.get('/', requireAuthRoute, profileController.renderProfile);
router.get('/support', requireAuthRoute, profileController.renderProfileSupport);
router.get('/schedules', requireAuthRoute, profileController.renderProfileSchedules);

module.exports = router;
