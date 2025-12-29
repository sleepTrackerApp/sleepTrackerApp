/**
 * Error page controller handlers.
 */

/**
 * Handler for 404 Not Found errors.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
function render404(req, res) {
  res.status(404).render('pages/errors/404', {
    title: '404 - Page Not Found',
  });
}

/**
 * Global error handler for 500 Internal Server Error and other errors.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
function render500(err, req, res, next) {
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
}

module.exports = {
  render404,
  render500,
};

