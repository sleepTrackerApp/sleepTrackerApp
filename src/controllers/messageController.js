const messageService = require('../services/messageService');
const { getReply } = require('../helpers/chatBot');

/**
 * GET /api/messages/list — paginated list of all messages (query: page, pageSize).
 * Uses requireAuthAPI + res.locals.userRecord.
 */
async function getMessageList(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const { page, pageSize, since } = req.query;
    const { messages, total } = await messageService.getMessageList(userId, {
      page,
      pageSize,
      since,
    });
    res.json({ success: true, messages, total });
  } catch (error) {
    console.error('Error getting message list:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/messages/chat — paginated chat log (query: page, pageSize).
 */
async function getChatLog(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const { page, pageSize, since } = req.query;
    const { messages, total } = await messageService.getChatLog(userId, {
      page,
      pageSize,
      since,
    });
    res.json({ success: true, messages, total });
  } catch (error) {
    console.error('Error getting chat log:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * PATCH /api/messages/:id/read — mark message as read.
 */
async function markAsRead(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const message = await messageService.markAsRead(req.params.id, userId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/messages/:id — delete message.
 */
async function deleteMessage(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const deleted = await messageService.deleteMessage(req.params.id, userId);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/messages/chat — save user message (user→bot). Body: { content }.
 * Saves, triggers bot reply, and emits chat:message + chat:reply via socket.
 * Client updates the chat only when it receives those socket events.
 */
async function postChatMessage(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const content = (req.body?.content ?? '').trim();
    if (!content) return res.status(400).json({ error: 'content is required' });
    console.log('[Chat] POST /api/messages/chat received', {
      userId: String(userId),
      content: content.substring(0, 80),
    });
    
    // Save the user's message first
    const message = await messageService.saveUserMessage(userId, content);
    console.log('[Chat] user message saved, socket chat:message emitted', { messageId: message._id });
    
    // Get bot reply and save it
    const replyText = await getReply(content, userId);
    const reply = await messageService.sendReply(userId, replyText);
    console.log('[Chat] bot reply saved, socket chat:reply emitted', {
      replyId: reply._id,
    });
    
    res.status(201).json({ success: true, message, reply });
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/messages/unread — unread count (for polling/UI).
 */
async function getUnreadCount(req, res) {
  try {
    const userId = res.locals.userRecord._id;
    const unreadCount = await messageService.getUnreadCount(userId);
    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getMessageList,
  getChatLog,
  markAsRead,
  deleteMessage,
  postChatMessage,
  getUnreadCount,
};
