const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores real-time messages between users with persistence.
 */
const messageSchema = new mongoose.Schema(
    {
        // Reference to sender User
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Reference to recipient User
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },

        // Message content
        content: {
            type: String,
            required: true,
            trim: true,
        },

        // Message type (text, notification, etc.)
        messageType: {
            type: String,
            enum: ['text', 'notification', 'system'],
            default: 'text',
        },

        // Whether the message has been read
        isRead: {
            type: Boolean,
            default: false,
        },

        // Timestamp of when the message was read
        readAt: {
            type: Date,
            required: false,
        },

        // Optional metadata (for extensibility)
        metadata: {
            type: Map,
            of: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
