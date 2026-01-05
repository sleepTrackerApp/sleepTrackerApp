/**
 * Controller handlers for API endpoints.
 */

/** Handler for the API welcome endpoint. */
function apiWelcome(req, res) {
  res.json({
    message: 'Welcome to the Alive Sleep Tracker API',
  });
}

/** Handler for unknown API endpoints (404 Not Found). */
function apiNotFound(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint does not exist',
      path: req.originalUrl,
    },
  });
}

/** Handler for unexpected API errors (500 Internal Server Error). */
function apiError(err, req, res, next) {
  console.error('Unhandled API error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing the request',
    },
  });
}

module.exports = {
  apiWelcome,
  apiNotFound,
  apiError,
};

