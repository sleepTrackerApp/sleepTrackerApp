const mongoose = require('mongoose');

/**
 * User Schema
 * Stores a hash of the Auth0 user ID and timestamps.
 */
const userSchema = new mongoose.Schema(
    {
        // Hash of the Auth0 user ID (sub)
        authIdHash: {
            type: String,
            required: true,
            unique: true,
        },
        // Optional test username for Socket.IO testing
        testUsername: {
            type: String,
            required: false,
            sparse: true,
        },
        // Goal restricted to 7-9 hours
        sleepGoal: {
            type: Number,
            default: 480, // 8 hours
            min: 420,     
            max: 540,     
        },
        goalLastUpdated: {
            type: Date,
            default: Date.now,
        },
        // Timestamp of the last login
        lastLoginAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);