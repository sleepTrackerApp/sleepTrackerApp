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

  // Provide default locals so templates can always reference them
  app.use((req, res, next) => {
    res.locals.title = null;
    res.locals.activeMenu = '';
    next();
  });

  // Serve static assets such as compiled stylesheets and client scripts
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/', routes);

  // Handle 404 Not Found error
  app.use((req, res) => {
    res.status(404).render('pages/errors/404', {
      title: '404 - Page Not Found',
    });
  });

  // Handle all unexpected errors
  app.use((err, req, res, next) => {
    // If headers are already sent, continue to the default error handler
    if (res.headersSent) {
      return next(err);
    }

    console.error('Unhandled error:', err);

    // Determine status code and error name
    // Status code can be in `status` or `statusCode` attribute
    const status = err.status || err.statusCode || 500;
    // Set a common error name if not provided
    const errorName = err.name || 'Internal Server Error';
    // Render the error page
    res.status(status).render('pages/errors/500', { title: `${status} - ${errorName}` });
  });

  return app;
}

module.exports = { createApp };

