/**
 * Controller to handle AI-generated sleep insights.
 */

const AIInsight = require('../models/AIInsight');
const { getSleepEntries } = require('../services/sleepEntryService');
const { generateSleepInsight } = require('../helpers/ai');
const { goalService, messageService } = require('../services');

/**
 * Fetches or generates a daily AI sleep insight for the user.
 * @param req - Express request object
 * @param res - Express response object
 * @returns {Promise<*>} - JSON response with sleep insight
 */
const getDailyInsight = async (req, res) => {
  try {
    const userId = res.locals.userRecord._id;
    const today = new Date();
    const dayKey = today.toISOString().split('T')[0];

    // 1. Fetch recent data (Last 7 logs) and goals
    const [userGoalRecord, { sleepEntries }] = await Promise.all([
      goalService.getGoal(userId),
      getSleepEntries(userId, 1, 7),
    ]);

    if (!sleepEntries || sleepEntries.length === 0) {
      return res
        .status(400)
        .json({ error: 'No sleep data available for analysis.' });
    }

    // 2. Determine if anything has changed since the last AI generation
    const latestLogUpdate = Math.max(
      ...sleepEntries.map((e) => new Date(e.updatedAt).getTime())
    );

    const targetMins =
      userGoalRecord?.goalValue > 0
        ? userGoalRecord.goalValue
        : 480;
    const goalText = `${Math.floor(targetMins / 60)}h ${targetMins % 60}m`;

    // 3. Use cache if logs and goals haven't changed
    const existingInsight = await AIInsight.findOne({
      userId,
      dayKey,
      periodType: 'weekly'
    }).lean();

    if (existingInsight) {
      const insightTime = new Date(
        existingInsight.generatedAt
      ).getTime() + 2000;
      
      const logTime = latestLogUpdate;

      const goalMatch = existingInsight.goalValue === targetMins;

      console.log(`[Cache Debug] Log: ${logTime}, Insight: ${insightTime}, GoalMatch: ${goalMatch}`);

      /**
       * ONLY serve the cache if:
       * 1. The insight was generated AFTER the last time a log was edited.
       * 2. The insight was generated using the current Sleep Goal text.
       */

      if (
        insightTime >= logTime &&
        goalMatch
      ) {
        console.log('[AI Scientist] No data changes. Serving cached insight. No new notification sent.');
        
        return res.json({
          source: 'cache',
          insight: {
            score: existingInsight.sleepScore,
            insight: existingInsight.insight,
            analysis: existingInsight.analysis,
            recommendation: existingInsight.recommendation,
          },
        });
      }
    }

    // 4. Generate fresh insight if logs or goal are new
    console.log(
      '[AI Scientist] Change detected in logs or goal. Generating fresh insight...'
    );

    const aiResponse = await generateSleepInsight(
      targetMins,
      sleepEntries,
      'weekly'
    );

    // 5. Save the new insight to the database
    await AIInsight.findOneAndUpdate(
      { userId, dayKey, periodType: 'weekly' },
      {
        $set: {
          goalValue: targetMins,
          startDate: sleepEntries[sleepEntries.length - 1].entryDate,
          endDate: sleepEntries[0].entryDate,
          sleepScore: aiResponse.score,
          insight: aiResponse.insight,
          analysis: aiResponse.analysis,
          recommendation: aiResponse.recommendation,
          generatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Trigger notification: Only for the fresh insights!
    messageService.sendText(
      userId,
      'Check out your new Sleep Health Insight in your dashboard.'
    );

    return res.json({
      source: 'api',
      insight: aiResponse,
    });
  } catch (error) {
    console.error('--- AI SCIENTIST DEBUG ERROR ---', error.message);
    res.status(500).json({
      error: 'Your Sleep Health Assistant is busy. Please try again later.',
    });
  }
};

module.exports = { getDailyInsight };
