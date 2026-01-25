/**
 * Page route: messages UI moved to /profile/support. Redirect legacy /messages.
 * API endpoints remain under /api/messages (apiMessageRoutes).
 */
const express = require('express');

const router = express.Router();

/** GET /messages — redirect to Support Chat in profile */
router.get('/', (req, res) => res.redirect(302, '/profile/support'));

module.exports = router;
