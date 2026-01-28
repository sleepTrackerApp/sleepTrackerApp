/**
 * Simple rule-based chat bot for the messages page. Returns a reply string
 * for a given user message. Can be replaced or extended with AI later.
 *
 * @param {string} userMessage - Trimmed user message
 * @returns {string} Bot reply text
 */

const scheduleService = require('../services/scheduleService');

/**
 * Async chat bot reply function. Returns a reply string for a given user message and userId.
 * @param {string} userMessage - Trimmed user message
 * @param {string|Object} [userId] - User ID for personalized data
 * @returns {Promise<string>} Bot reply text
 */
async function getReply(userMessage, userId) {
  if (!userMessage || typeof userMessage !== 'string') {
    return "Say something and I'll do my best to help.";
  }

  const lower = userMessage.toLowerCase();

  // Rule-based for core app features
  if (
    /^(hi|hey|hello|hi there)\s*!?\.?$/i.test(userMessage.trim()) ||
    lower === 'hello' ||
    lower === 'hi'
  ) {
    return "Hi! I'm the Alive support bot. You can ask me about schedules, sleep tips, or logging your sleep.";
  }

  if (/\b(schedule|schedules|reminder|bedtime|notification)\b/.test(lower)) {
    if (!userId) {
      return 'To show your schedules, please sign in.';
    }
    try {
      const { items, total } = await scheduleService.listSchedules(
        userId,
        1,
        5
      );
      if (!items.length) {
        return "You don't have any schedules set up yet. Go to your Dashboard → Sleep Schedules to add one!";
      }
      let reply = `You have ${total} schedule${total === 1 ? '' : 's'}:`;
      for (const sched of items) {
        if (sched.type === 'bedtime') {
          const days =
            Array.isArray(sched.daysOfWeek) && sched.daysOfWeek.length
              ? sched.daysOfWeek
                  .map(
                    (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
                  )
                  .join(', ')
              : 'every day';
          reply += `\n• ${sched.name}: Bedtime at ${sched.timeOfDay?.hour?.toString().padStart(2, '0') ?? '--'}:${sched.timeOfDay?.minute?.toString().padStart(2, '0') ?? '--'} on ${days}`;
        } else {
          reply += `\n• ${sched.name}: Custom schedule (${sched.cron})`;
        }
      }
      if (total > items.length)
        reply += `\n(Only showing the first ${items.length}. See Dashboard for all.)`;
      return reply;
    } catch (err) {
      return "Sorry, I couldn't fetch your schedules right now. Please try again later.";
    }
  }

  if (/\b(sleep|sleeping|tips|improve|quality|routine)\b/.test(lower)) {
    return 'For better sleep: try a consistent bedtime, limit screens before bed, and keep your room cool. Log your sleep on the dashboard to track trends.';
  }

  if (/\b(log|logging|how do i|how to)\b/.test(lower)) {
    return 'Log your sleep from the Dashboard — choose a date, enter duration or bed/wake times, and add an optional rating. Your history powers your insights.';
  }

  if (/\b(help|support|stuck)\b/.test(lower)) {
    return "I'm here to help. Ask about schedules, sleep tips, or how to log sleep. For account or technical issues, contact support@alive.app.";
  }

  if (/\b(thank|thanks|thx)\b/.test(lower)) {
    return "You're welcome! Have a great rest.";
  }

  // For all other questions, just return a static message
  return 'I can help with schedules, sleep tips, and logging — just ask in a sentence or two.';
}

module.exports = { getReply };
