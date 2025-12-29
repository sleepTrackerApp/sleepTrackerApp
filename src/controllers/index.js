/**
 * Aggregates and exposes controller modules for easy importing.
 */
const homeControllers = require('./homeControllers');
const apiControllers = require('./apiControllers');
const dashboardControllers = require('./dashboardControllers');
const authControllers = require('./authControllers');
const errorControllers = require('./errorControllers');

module.exports = {
  homeControllers,
  apiControllers,
  dashboardControllers,
  authControllers,
  errorControllers,
};

