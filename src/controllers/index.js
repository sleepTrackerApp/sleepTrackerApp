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
const scheduleController = require('./scheduleController');
const goalController = require('./goalController');

module.exports = {
  apiControllers,
  insightControllers,
  sleepEntryController,
  weeklySummaryController,
  authControllers,
  errorControllers,
  homeControllers,
  dashboardControllers,
  scheduleController,
  goalController,
};
