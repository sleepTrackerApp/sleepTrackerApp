const mongoose = require('mongoose');

/**
 * Sleep Entries Schema
 * References the User ID to correlate data owner.
 * Store date, duration (minutes), optional start/end times, and rating.
 */
const sleepEntrySchema = new mongoose.Schema(
    {
        // Reference User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Date of the sleep entry entered
        entryDate: {
            type: Date,
            required: true,
        },

        // Total minutes slept
        duration: {
            type: Number,
            required: true,
            min: 0,
            max: 1440,
        },

        // When the user went to sleep
        startTime: {
            type: Date,
            required: false,
        },

        // When the user woke up
        endTime: {
            type: Date,
            required: false,
        },
        // Sleep quality Rating
        rating: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: userId and entryDate must be unique together
sleepEntrySchema.index({ userId: 1, entryDate: 1 }, { unique: true });

module.exports = mongoose.model("SleepEntry", sleepEntrySchema);

