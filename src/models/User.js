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