/**
 * REST API for message functions backend.
 * Mounted at /api/messages.
 */
const express = require('express');
const messageController = require('../controllers/messageController');
const { requireAuthAPI } = require('../helpers/auth');

const router = express.Router();

/** GET /api/messages/list — paginated list (query: page, pageSize) */
router.get('/list', requireAuthAPI, messageController.getMessageList);

/** GET /api/messages/chat — paginated chat log (query: page, pageSize) */
router.get('/chat', requireAuthAPI, messageController.getChatLog);

/** GET /api/messages/unread — unread count */
router.get('/unread', requireAuthAPI, messageController.getUnreadCount);

/** PATCH /api/messages/:id/read — mark as read */
router.patch('/:id/read', requireAuthAPI, messageController.markAsRead);

/** DELETE /api/messages/:id — delete message */
router.delete('/:id', requireAuthAPI, messageController.deleteMessage);

/** POST /api/messages/chat — save user message (body: { content }) */
router.post('/chat', requireAuthAPI, messageController.postChatMessage);

module.exports = router;
