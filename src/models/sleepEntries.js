const mongoose = require('mongoose');

/**
 * Sleep Entries Schema
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

    // Date of the sleep entry entered
    entryDate: {
      type: Date,
      required: true,
    },

    // Total hours slept
    hours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
      
    // When the user went to sleep
    startTime: {
      type: Date,
      required: true,
    },

    // When the user woke up
    endTime: {
      type: Date,
      required: true,
    },
    // Sleep quality Rating
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,  
  }
);

module.exports = mongoose.model("SleepEntry", sleepEntriesSchema);

