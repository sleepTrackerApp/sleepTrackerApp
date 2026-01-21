const mongoose = require('mongoose');
const { Message, User } = require('../models');

async function resolveUser(identifier) {
  if (!identifier) return null;

  // Try by ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) return byId;
  }

  // Try by authIdHash
  const byAuth = await User.findOne({ authIdHash: identifier });
  if (byAuth) return byAuth;

  // Try by testUsername
  const byTest = await User.findOne({ testUsername: identifier });
  if (byTest) return byTest;

  // Create a lightweight test user for this identifier
  return User.create({
    authIdHash: `api_${identifier}_${Date.now()}`,
    testUsername: identifier,
  });
}

async function apiSendMessage(req, res) {
  try {
    const { senderId, recipientId, content, messageType = 'text' } = req.body || {};
    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ success: false, error: 'senderId, recipientId, and content are required' });
    }

    const io = req.app.get('io');
    if (!io) {
      return res.status(500).json({ success: false, error: 'Socket.IO not available' });
    }

    const sender = await resolveUser(senderId);
    const recipient = await resolveUser(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ success: false, error: 'Sender or recipient not found/created' });
    }

    const message = await Message.create({
      senderId: sender._id,
      recipientId: recipient._id,
      content,
      messageType,
      isRead: false,
    });

    // Emit to recipient if online; key uses the same identifier the client used to register
    const userSockets = io.locals?.userSockets;
    const recipientSocketId = userSockets ? userSockets.get(recipientId) : null;
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message:receive', {
        _id: message._id,
        senderId: sender._id,
        senderUsername: sender.testUsername || sender.authIdHash,
        content,
        messageType,
        createdAt: message.createdAt,
      });
    }

    return res.json({
      success: true,
      data: {
        messageId: message._id,
        delivered: Boolean(recipientSocketId),
      },
    });
  } catch (err) {
    console.error('apiSendMessage error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}

module.exports = { apiSendMessage };
