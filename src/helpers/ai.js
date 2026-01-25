const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'openai-api-key',
});

/**
 * LOGIC: The "Prompt Builder"
 * Maps SleepEntry data into a narrative for the AI.
 */

const _buildPrompt = (userGoalMins, sleepLogs, periodType) => {
    // Convert DB logs into a readable string for the AI
    const logSummary = sleepLogs.map(log => 
        `Date: ${log.entryDate.toDateString()}, Duration: ${log.duration}m, Rating: ${log.rating}/10`
    ).join(' | ');

    const timeFrame = periodType === 'weekly' ? '7 days' : '30 days';

    return `
        CONTEXT: 
        You are the 'Alive' Sleep Scientist, an expert in circadian rhythms and sleep hygiene. 
        'Alive' is a wellness app dedicated to helping people understand that quality sleep 
        is the foundation of a vibrant life. Your mission is to empower users to wake up 
        feeling "Alive" through data-driven coaching. You are professional, encouraging, 
        supportive, data-driven, and highly specific.

        USER DATA:
        - Timeframe: Past ${timeFrame}
        - Personal Goal: ${userGoalMins} minutes (Range: 7-9 hours)
        - Sleep Logs: ${logSummary}

        INSTRUCTIONS FOR ANALYSIS:
        - Be Specific: Mention specific days or trends (e.g., "Your consistency on Wed-Fri was elite").
        - Be Motivational: Start by acknowledging a positive trend (like a high quality rating).
        - Identify the Gap: Clearly explain the distance between their current average and their ${userGoalMins}m goal.

        INSTRUCTIONS FOR RECOMMENDATION:
        - Actionable: Provide 1-2 "Key Focus Points" for improvement. 
        - Simple: Ensure the advice is something they can do TONIGHT.

        TASK:
        1. Calculate a Sleep Score (0-100) using this rationale:
           - 50% Goal Achievement: How close they are to the ${userGoalMins}m goal.
           - 30% Consistency: Stability of sleep duration across the ${periodType} period.
           - 20% Subjective Quality: Average of user-provided ratings.

        2. Provide the response strictly in this JSON format:
        {
            "score": [number],
            "insight": "[Short bur meaningful headline]",
            "analysis": "[2-3 sentences explaining ${periodType} trends]",
            "recommendation": "[1 actionable tip or instruction for the user]"
        }
    `;
};

/**
 * EXECUTION: The "API Caller"
 * Sends the constructed prompt to OpenAI and returns the structured data.
 */

const generateSleepInsight = async (userGoalMins, sleepLogs, periodType = 'weekly') => {
    // Get the formatted prompt from the logic function
    const prompt = _buildPrompt(userGoalMins, sleepLogs, periodType);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { 
                    role: "system", 
                    content: "You are the 'Alive' Sleep Health Scientist. You provide high-detail, encouraging JSON feedback." 
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI API Execution Error:", error);
        throw new Error("Failed to generate AI insights. Please check API configuration.");
    }
};

module.exports = { generateSleepInsight, _buildPrompt };