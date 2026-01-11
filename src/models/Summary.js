const mongoose = require('mongoose');

/**
 * Summary Schema
 * References the User ID to correlate data owner.
 */
const summarySchema = new mongoose.Schema(
    {
        // Reference User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Date of when Average Record created
        endryDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        // Store average with upper and lower bounds.
        avgHours: {
            type: Number,
            min: 0,
            max: 24, // Cannot be greater than 24 hours within a day.
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Summary || mongoose.model('Summary', summarySchema);

