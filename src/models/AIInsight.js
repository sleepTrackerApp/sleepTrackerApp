const mongoose = require('mongoose');

/**
 * AI Insight Schema
 * Stores weekly or monthly sleep analysis and scores.
 */

const aiInsightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    periodType: { 
        type: String, 
        enum: ['weekly', 'monthly'], 
        required: true 
    },

    // A string representing the day it was generated (e.g., "2026-01-24")
    // This ensures consistency if the user clicks 'View' multiple times in one day.
    dayKey: { 
        type: String, 
        required: true 
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    sleepScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    // Structured AI Response
    insight: { type: String, required: true },       // Headline
    analysis: { type: String, required: true },      // Data-driven observations
    recommendation: { type: String, required: true }, // Actionable advice

    generatedAt: {
        type: Date,
        default: Date.now
    }
});

aiInsightSchema.index({ userId: 1, periodType: 1, dayKey: 1 }, { unique: true });

module.exports = mongoose.model('AIInsight', aiInsightSchema);