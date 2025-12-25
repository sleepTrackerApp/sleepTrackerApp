/**
 * Builds and configures the Express application instance
 */
const path = require('path');
const express = require('express');
const routes = require('./routes');

/**
 * Application factory to create and configure the Express app
 * @returns {*|Express}
 */
function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use('/', routes);

  return app;
}

module.exports = { createApp };

