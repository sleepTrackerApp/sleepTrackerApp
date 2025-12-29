/**
 * Builds and configures the Express application instance
 */

const path = require('path');
const express = require('express');
const { createAuthMiddleware, userSyncMiddleware } = require('./helpers/auth');
const routes = require('./routes');

/**
 * Application factory to create and configure the Express app
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

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


  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  /* ---------------- Routes ---------------- */

  app.use('/', routes);

  /* ---------------- Error Handling ---------------- */

  // 404 handler
  app.use((req, res) => {
    res.status(404).render('pages/errors/404', {
      title: '404 - Page Not Found',
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    // If headers are already sent, delegate to the default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // Log the error for debugging
    console.error('Unhandled error:', err);

    // Get status code and error name
    const status = err.status || err.statusCode || 500;
    const errorName = err.name || 'Internal Server Error';

    res.status(status).render('pages/errors/500', {
      title: `${status} - ${errorName}`,
    });
  });

  return app;
}

module.exports = { createApp };
