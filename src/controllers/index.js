/**
 * Aggregates and exposes controller modules for easy importing.
 */
const apiControllers = require('./apiControllers');
const insightControllers = require('./insightControllers');
const sleepEntryController = require('./sleepEntryController');
const weeklySummaryController = require('./weeklySummaryController');
const authControllers = require('./authControllers');
const errorControllers = require('./errorControllers');
const homeControllers = require('./homeControllers');
const dashboardControllers = require('./dashboardControllers');

module.exports = {
  apiControllers,
  insightControllers,
  sleepEntryController,
  weeklySummaryController,
  authControllers,
  errorControllers,
  homeControllers,
  dashboardControllers,
};
