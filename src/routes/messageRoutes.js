const express = require('express');
const { renderMessages, getConversation, getUnreadCount } = require('../controllers/messageController');
const { requireAuthRoute } = require('../helpers/auth');

const router = express.Router();

/**
 * GET /messages
 * Render messages page
 */
router.get('/', requireAuthRoute, renderMessages);

/**
 * GET /messages/unread
 * Get unread message count
 */
router.get('/unread', requireAuthRoute, getUnreadCount);

/**
 * GET /messages/:otherUserId
 * Get conversation with specific user
 */
router.get('/:otherUserId', requireAuthRoute, getConversation);

module.exports = router;
