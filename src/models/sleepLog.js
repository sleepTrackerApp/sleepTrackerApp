const mongoose = require('mongoose');

/**
 * SleepLog Schema
 * Captures sleep data matching the "Log Last Night's Sleep" UI.
 */
const sleepLogSchema = new mongoose.Schema({
  // Link to the User (using the secure hash ID)
  userHashId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // The "Night of..." date (e.g., Dec 26, 2025)
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },

  // Total sleep in hours
  duration: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 24 
  }, 

  // Slider Value for Sleep Quality (0-10)
  quality: { 
    type: Number, 
    required: true,
    min: 0,
    max: 10
  },
  
  // Only used if "By Time" tab was selected
  bedTime: { type: Date },
  wakeTime: { type: Date },

  notes: { 
    type: String,
    maxLength: 500
  }
}, {
  timestamps: true
});

// Prevent duplicate logs for the same user on the same date
sleepLogSchema.index({ userHashId: 1, date: -1 });

module.exports = mongoose.models.SleepLog || mongoose.model('SleepLog', sleepLogSchema);