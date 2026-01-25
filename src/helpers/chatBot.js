/**
 * Simple rule-based chat bot for the messages page. Returns a reply string
 * for a given user message. Can be replaced or extended with AI later.
 *
 * @param {string} userMessage - Trimmed user message
 * @returns {string} Bot reply text
 */
function getReply(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return "Say something and I'll do my best to help.";
  }

  const lower = userMessage.toLowerCase();

  if (/^(hi|hey|hello|hi there)\s*!?\.?$/i.test(userMessage.trim()) || lower === 'hello' || lower === 'hi') {
    return "Hi! I'm the Alive support bot. You can ask me about schedules, sleep tips, or logging your sleep.";
  }

  if (/\b(schedule|schedules|reminder|bedtime|notification)\b/.test(lower)) {
    return "You can manage schedules and bedtime reminders from your Dashboard → Schedules. Set a time and we'll notify you when it's time for bed.";
  }

  if (/\b(sleep|sleeping|tips|improve|quality|routine)\b/.test(lower)) {
    return "For better sleep: try a consistent bedtime, limit screens before bed, and keep your room cool. Log your sleep on the dashboard to track trends.";
  }

  if (/\b(log|logging|how do i|how to)\b/.test(lower)) {
    return "Log your sleep from the Dashboard — choose a date, enter duration or bed/wake times, and add an optional rating. Your history powers your insights.";
  }

  if (/\b(help|support|stuck)\b/.test(lower)) {
    return "I'm here to help. Ask about schedules, sleep tips, or how to log sleep. For account or technical issues, contact support@alive.app.";
  }

  if (/\b(thank|thanks|thx)\b/.test(lower)) {
    return "You're welcome! Have a great rest.";
  }

  return "Thanks for your message. I can help with schedules, sleep tips, and logging — just ask in a sentence or two.";
}

module.exports = { getReply };
