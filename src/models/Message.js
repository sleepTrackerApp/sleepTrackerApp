const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores messages for a user: announcements (text), user messages to chat-bot (message),
 * and bot replies (reply). userId is always the receiving user (the human).
 */
const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'message', 'reply'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// createdAt = sent time
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, isRead: 1 });

module.exports =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
