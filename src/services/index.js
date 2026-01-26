/**
 * Aggregates all service modules for easy importing.
 */

module.exports = {
  userService: require('./userService'),
  contentfulService: require('./contentfulService'),
  sleepEntryService: require('./sleepEntryService'),
  weeklySummaryService: require('./weeklySummaryService'),
  scheduleService: require('./scheduleService'),
  goalService: require('./goalService'),
  messageService: require('./messageService'),
};
