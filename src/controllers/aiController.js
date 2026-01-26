const AIInsight = require('../models/AIInsight');
const { User, Goal } = require('../models'); 
const { getSleepEntries } = require('../services/sleepEntryService');
const { generateSleepInsight } = require('../helpers/ai');
const { goalService } = require('../services');

const getDailyInsight = async (req, res) => {
    try {
        const userId = res.locals.userRecord._id;
        
        // 1. Generate the unique dayKey (YYYY-MM-DD) 
        // This ensures the user only gets one unique insight per day
        const today = new Date();
        const dayKey = today.toISOString().split('T')[0];

        // 2. Check the "Memory" (Model) first to save costs
        const existingInsight = await AIInsight.findOne({ userId, dayKey });

        console.log(existingInsight)
        
        if (existingInsight) {
            return res.json({ 
                source: 'cache', 
                insight: {
                    score: existingInsight.sleepScore,
                    insight: existingInsight.insight,
                    analysis: existingInsight.analysis,
                    recommendation: existingInsight.recommendation
                }
            });
        }

        // 3. Fetch recent data (Last 7 logs)
        const { sleepEntries } = await getSleepEntries(userId, 1, 7);

        if (!sleepEntries || sleepEntries.length === 0) {
            return res.status(400).json({ error: 'No sleep data available for analysis.' });
        }

        const userGoalRecord = await goalService.getGoal(userId);
        const targetMins = (userGoalRecord && userGoalRecord.goalValue > 0) ? userGoalRecord.goalValue : 480;

        // 4. Trigger the Helper with the 7-9h goal (480 mins)
        // This uses the 50/30/20 scoring rationale built in ai.js
        const aiResponse = await generateSleepInsight(targetMins, sleepEntries, 'weekly');

        // 5. Save the new insight for daily consistency
        const newRecord = new AIInsight({
            userId,
            dayKey,
            periodType: 'weekly',
            startDate: sleepEntries[sleepEntries.length - 1].entryDate,
            endDate: sleepEntries[0].entryDate,
            sleepScore: aiResponse.score,
            insight: aiResponse.insight,
            analysis: aiResponse.analysis,
            recommendation: aiResponse.recommendation
        });

        await newRecord.save();

        return res.json({ 
            source: 'api', 
            insight: aiResponse 
        });

    } catch (error) {
        console.error('--- AI SCIENTIST DEBUG ERROR ---');
        console.error('Message:', error.message);

        if (error.response) {
            console.error('OpenAI Status:', error.response.status);
            console.error('OpenAI Data:', error.response.data);
        }
        
        res.status(500).json({ error: 'Your Sleep Health Assistant is busy. Please try again later.' });
    }
};

module.exports = { getDailyInsight };