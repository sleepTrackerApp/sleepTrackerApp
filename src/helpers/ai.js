const { OpenAI } = require('openai');
const { appConfig } = require('./settings');

const openai = new OpenAI({
  apiKey: appConfig.OPENAI_API_KEY || 'openai-api-key',
});

/**
 * LOGIC: The "Prompt Builder"
 * Maps SleepEntry data into a narrative for the AI.
 */

const _buildPrompt = (userGoalMins, sleepLogs, periodType) => {
    // Convert DB logs into a readable string for the AI
    const logSummary = sleepLogs.map(log => 
        `Date: ${new Date(log.entryDate).toDateString()}, Duration: ${log.duration}m, Rating: ${log.rating}/10`
    ).join(' | ');

    const timeFrame = periodType === 'weekly' ? '7 days' : '30 days';

    // Convert goal minutes to hours for the AI's reference
    const goalHrs = Math.floor(userGoalMins / 60);
    const goalMins = userGoalMins % 60;
    const goalText = goalMins > 0 ? `${goalHrs}h ${goalMins}m` : `${goalHrs}h`;

    return `
        CONTEXT: 
        You are the 'Alive' Sleep Scientist, an expert in circadian rhythms and sleep hygiene. 
        'Alive' is a wellness app dedicated to helping people understand that quality sleep 
        is the foundation of a vibrant life. Your mission is to empower users to wake up 
        feeling "Alive" through data-driven coaching. You are professional, encouraging, 
        supportive, data-driven, and highly specific.

        USER DATA:
        - Timeframe: Past ${timeFrame}
        - Personal Goal: ${goalText} (${userGoalMins} minutes)
        - Sleep Logs: ${logSummary}

        INSTRUCTIONS FOR ANALYSIS:
        - NO MINUTES: Never write "415 minutes". Use the format "6h55m".
        - BULLET POINTS: The "analysis" section MUST use "-" bullet points for every distinct observations.
        - BE SPECIFIC: Mention specific days or trends.
        - BE MOTIVATION: Start by acknowledging a positive trend (like a high quality rating).
        - IDENTIFY AND EMPHASIZE THE GAPS: Clearly explain the distance between their current average and their ${userGoalMins}m goal.
        - STYLE: The writing should be easy to understand, clear, and focus.

        INSTRUCTIONS FOR RECOMMENDATION:
        - ACTIONABLE: Provide 1-2 "Key Focus Points" for improvement. 
        - SIMPLE: Ensure the advice is something they can do TONIGHT.

        TASK:
        1. Calculate a Sleep Score (0-100) using this rationale:
           - 50% Goal Achievement: How close they are to the ${userGoalMins}m goal.
           - 30% Consistency: Stability of sleep duration across the ${periodType} period.
           - 20% Subjective Quality: Average of user-provided ratings.

        2. Provide the response strictly in this JSON format:
        {
            "score": [number],
            "insight": "[Short but meaningful headline]",
            "analysis": "[3 sentences explaining ${periodType} trends], - [Sentence 1 in h/m format]\\n - [Sentence 2 in h/m format], - [Sentence 3 in h/m format]",
            "recommendation": "[1-2 actionable tips or instruction for the user tonight and onwards]"
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
                    content: `You are the 'Alive' Sleep Health Scientist. 
                              STRICT RULES:
                              - ALWAYS convert minutes to "XhYm" format.
                              - "Analysis" MUST be 3 sentences, each starting with a "- ".
                              - Use \\n between sentences.` 
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