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

    // 1. Fetch recent data (Last 7 logs) and latest logs
    const [userGoalRecord, { sleepEntries }] = await Promise.all([
      goalService.getGoal(userId),
      getSleepEntries(userId, 1, 7),
    ]);

    if (!sleepEntries || sleepEntries.length === 0) {
      return res
        .status(400)
        .json({ error: 'No sleep data available for analysis.' });
    }

    // 2. Identify the state of the data
    const latestLogDate = sleepEntries[0].entryDate;
    const latestLogUpdate = Math.max(
      ...sleepEntries.map((e) => new Date(e.updatedAt).getTime())
    );

    const targetMins =
      userGoalRecord && userGoalRecord.goalValue > 0
        ? userGoalRecord.goalValue
        : 480;
    const goalText = `${Math.floor(targetMins / 60)}h ${targetMins % 60}m`;

    // 3. Use cache if logs and goals haven't changed
    const existingInsight = await AIInsight.findOne({
      userId,
      dayKey,
      endDate: latestLogDate,
    });

    if (existingInsight) {
      const insightGeneratedAt = new Date(
        existingInsight.generatedAt
      ).getTime();
      // If the report was made AFTER the last log update, serve the cache
      if (
        insightGeneratedAt > latestLogUpdate &&
        existingInsight.analysis.includes(goalText)
      ) {
        console.log('[AI Scientist] Data is fresh. Serving cached insight.');
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

    // 4. Generate fresh insight if logs are new
    console.log(
      '[AI Scientist] Change detected in logs or goal. Generating fresh insight...'
    );

    const aiResponse = await generateSleepInsight(
      targetMins,
      sleepEntries,
      'weekly'
    );

    // 5. Update the new insight if it exists, otherwise create
    await AIInsight.findOneAndUpdate(
      { userId, dayKey, periodType: 'weekly' },
      {
        $set: {
          startDate: sleepEntries[sleepEntries.length - 1].entryDate,
          endDate: latestLogDate,
          sleepScore: aiResponse.score,
          insight: aiResponse.insight,
          analysis: aiResponse.analysis,
          recommendation: aiResponse.recommendation,
          generatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    messageService.sendText(
      userId,
      'Your new Sleep Health Insight is ready! Check it out in your dashboard.'
    );

    return res.json({
      source: 'api',
      insight: aiResponse,
    });
  } catch (error) {
    console.error('--- AI SCIENTIST DEBUG ERROR ---');
    console.error('Message:', error.message);

    if (error.response) {
      console.error('OpenAI Status:', error.response.status);
      console.error('OpenAI Data:', error.response.data);
    }

    res.status(500).json({
      error: 'Your Sleep Health Assistant is busy. Please try again later.',
    });
  }
};

module.exports = { getDailyInsight };
