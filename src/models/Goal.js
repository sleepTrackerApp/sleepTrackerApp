const mongoose = require('mongoose');

/**
 * Goal Schema
 * Stores goal value (sleep duration) for a user and the date when the goal
 * has been set. The model stores all entered goals for historical purposes.
 * The active goal is the most recent one (determined by setDate).
 */
const goalSchema = new mongoose.Schema(
    {
        // Reference User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Goal value: sleep duration in minutes
        goalValue: {
            type: Number,
            required: true,
            min: 0,
            max: 1440, // Maximum 24 hours in minutes
        },

        // Date when the goal was set (normalized to start of day for uniqueness)
        setDate: {
            type: Date,
            required: true,
            default: Date.now,
            set: (date) => {
                // Force to the midnight to ensure one goal per day
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
            },
        },
    }
);

// Compound unique index: one goal per user per day
goalSchema.index({ userId: 1, setDate: 1 }, { unique: true });

// Index for efficient querying of user goals, sorted by setDate (most recent first)
goalSchema.index({ userId: 1, setDate: -1 });

module.exports = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
