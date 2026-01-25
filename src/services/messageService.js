/**
 * Message service: all DB access for messages. Sends text and replies via the
 * socket helper for real-time delivery. No socket logic here—only calls
 * socket.deliver after persisting.
 */
const { Message } = require('../models');
const { deliver } = require('../helpers/socket');

const DEFAULT_PAGE_SIZE = 20;

/**
 * Send an announcement (type 'text') to a user: persist and deliver in real time.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {string} content
 * @returns {Promise<import('../models/Message')>}
 */
async function sendText(userId, content) {
  const message = await Message.create({
    userId,
    messageType: 'text',
    content,
    isRead: false,
  });
  deliver(userId, {
    type: 'announcement',
    content: message.content,
    messageId: message._id,
    createdAt: message.createdAt,
  });
  return message;
}

/**
 * Send a bot reply (type 'reply') to a user: persist and deliver in real time.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {string} content
 * @returns {Promise<import('../models/Message')>}
 */
async function sendReply(userId, content) {
  const message = await Message.create({
    userId,
    messageType: 'reply',
    content,
    isRead: false,
  });
  deliver(userId, {
    type: 'reply',
    content: message.content,
    messageId: message._id,
    createdAt: message.createdAt,
  }, 'chat:reply');
  return message;
}

/**
 * Save a user message (type 'message') and deliver it via socket so the chat widget
 * on all of the user's tabs/pages can show it (POST then echo).
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {string} content
 * @returns {Promise<import('../models/Message')>}
 */
async function saveUserMessage(userId, content) {
  const message = await Message.create({
    userId,
    messageType: 'message',
    content,
    isRead: false,
  });
  deliver(userId, {
    type: 'message',
    content: message.content,
    messageId: message._id,
    createdAt: message.createdAt,
  }, 'chat:message');
  return message;
}

/**
 * Get paginated list of all messages for a user (newest first).
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {{ page?: number, pageSize?: number }} options
 * @returns {Promise<{ messages: import('../models/Message')[], total: number }>}
 */
async function getMessageList(userId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(options.pageSize) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * pageSize;

  const [messages, total] = await Promise.all([
    Message.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Message.countDocuments({ userId }),
  ]);

  return { messages, total };
}

/**
 * Get paginated chat log (only type 'message' and 'reply') for a user, oldest first.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {{ page?: number, pageSize?: number }} options
 * @returns {Promise<{ messages: import('../models/Message')[], total: number }>}
 */
async function getChatLog(userId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(options.pageSize) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * pageSize;

  const filter = { userId, messageType: { $in: ['message', 'reply'] } };
  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Message.countDocuments(filter),
  ]);

  return { messages, total };
}

/**
 * Mark a message as read. Only if it belongs to the given user.
 * @param {string|import('mongoose').Types.ObjectId} messageId
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<import('../models/Message') | null>}
 */
async function markAsRead(messageId, userId) {
  return await Message.findOneAndUpdate(
    { _id: messageId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
}

/**
 * Delete a message. Only if it belongs to the given user.
 * @param {string|import('mongoose').Types.ObjectId} messageId
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteMessage(messageId, userId) {
  const result = await Message.deleteOne({ _id: messageId, userId });
  return result.deletedCount === 1;
}

/**
 * Get unread message count for a user.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<number>}
 */
async function getUnreadCount(userId) {
  return Message.countDocuments({ userId, isRead: false });
}

module.exports = {
  sendText,
  sendReply,
  saveUserMessage,
  getMessageList,
  getChatLog,
  markAsRead,
  deleteMessage,
  getUnreadCount,
};
