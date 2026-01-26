/**
 * Aggregates and exposes controller modules for easy importing.
 */
const apiControllers = require('./apiControllers');
const articleControllers = require('./articleControllers');
const sleepEntryController = require('./sleepEntryController');
const weeklySummaryController = require('./weeklySummaryController');
const authControllers = require('./authControllers');
const errorControllers = require('./errorControllers');
const homeControllers = require('./homeControllers');
const dashboardControllers = require('./dashboardControllers');
const scheduleController = require('./scheduleController');
const goalController = require('./goalController');
const insightsController = require('./insightsController');

module.exports = {
  apiControllers,
  articleControllers,
  sleepEntryController,
  weeklySummaryController,
  authControllers,
  errorControllers,
  homeControllers,
  dashboardControllers,
  scheduleController,
  goalController,
  insightsController,
};
