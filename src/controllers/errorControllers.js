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
    isErrorPage: true,
  });
}

/**
 * Global error handler for 500 Internal Server Error and other errors.
 * When status is 404, renders the 404 page instead of the 500 page.
 * @param {Error|{ statusCode?: number, status?: number, message?: string }} err - The error object.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
function render500(err, req, res, next) {
  // If headers are already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? err.statusCode ?? 500;

  if (status === 404) {
    return render404(req, res);
  }

  // Log the error for debugging
  console.error('Unhandled error:', err);

  const errorName = err.name || 'Internal Server Error';
  const subtitle =
    status === 500 && errorName === 'Internal Server Error'
      ? 'Internal server error'
      : `${status} - ${errorName}`;
  res.status(status).render('pages/errors/500', {
    title: subtitle,
    isErrorPage: true,
  });
}

module.exports = {
  render404,
  render500,
};

