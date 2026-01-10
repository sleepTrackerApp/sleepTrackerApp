/**
 * Builds and configures the Express application instance
 * This app is used in both local server and serverless environments
 */

const path = require('path');
const express = require('express');
const { createAuthMiddleware, userSyncMiddleware } = require('./helpers/auth');
const routes = require('./routes');
const { render404, render500 } = require('./controllers/errorControllers');


/**
 * Application factory to create and configure the Express app
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  /* ---------------- Middleware ---------------- */

  // Auth0 OIDC middleware & user sync
  app.use(createAuthMiddleware());
  app.use(userSyncMiddleware);

  // Parse incoming request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));


  /* ---------------- Routes ---------------- */

  app.use('/', routes);

  /* ---------------- Error Handling ---------------- */

  // 404 handler
  app.use(render404);

  // Global error handler
  app.use(render500);

  return app;
}

module.exports = createApp;