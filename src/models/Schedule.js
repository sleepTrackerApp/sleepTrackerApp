const mongoose = require('mongoose');

/**
 * Schedule Schema
 * Defines user-specific schedules for reminders or background jobs.
 * Supports simple bedtime reminders (time + daysOfWeek) and custom cron rules.
 */
const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['bedtime', 'custom-cron'],
      required: true,
    },
    // For type: bedtime
    timeOfDay: {
      hour: { type: Number, min: 0, max: 23 },
      minute: { type: Number, min: 0, max: 59 },
    },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun .. 6=Sat

    // For type: custom-cron
    cron: { type: String, default: null },

    enabled: { type: Boolean, default: true },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Unique schedule name per user
scheduleSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
