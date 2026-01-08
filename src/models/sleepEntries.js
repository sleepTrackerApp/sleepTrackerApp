const mongoose = require('mongoose');

/**
 * Summary Schema
 * References the User ID to correlate data owner.
 */
const sleepEntriesSchema = new mongoose.Schema(
    {
        // Reference User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },

    {
        timestamps: true,
    }
);

module.exports = mongoose.models.sleepEntries || mongoose.model('Summary', sleepEntriesSchema);


