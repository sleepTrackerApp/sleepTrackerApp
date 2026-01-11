/**
 * Aggregates and exposes controller modules for easy importing.
 */
const apiControllers = require('./apiControllers');
const insightControllers = require('./insightControllers');
const sleepEntryController = require('./sleepEntryController');
const authControllers = require('./authControllers');
const errorControllers = require('./errorControllers');
const homeControllers = require('./homeControllers');
const dashboardControllers = require('./dashboardControllers');

module.exports = {
  apiControllers,
  insightControllers,
  sleepEntryController,
  authControllers,
  errorControllers,
  homeControllers,
  dashboardControllers,
};
