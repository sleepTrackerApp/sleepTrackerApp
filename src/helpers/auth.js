/**
 * Configures Auth0 authentication middleware for the Express app.
 */

const { auth } = require('express-openid-connect');
const { appConfig } = require('./settings');

/**
 * Derives the absolute base URL for the Auth0 middleware.
 * Ensures localhost URLs include the configured port while hosted URLs remain unchanged.
 * @returns {string}
 */
function resolveBaseUrl() {
  const url = new URL(appConfig.BASE_URL);

  // Add port for localhost if not already specified
  if (!url.port && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    url.port = appConfig.PORT.toString();
  }

  // Remove trailing slashes
  return url.toString().replace(/\/+$/, '');
}

/**
 * Returns the express-openid-connect middleware configured with application settings.
 */
function createAuthMiddleware() {
  const authConfig = /** @type {import('express-openid-connect').ConfigParams} */ ({
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: appConfig.AUTH0.ISSUER_BASE_URL,
    baseURL: resolveBaseUrl(),
    clientID: appConfig.AUTH0.CLIENT_ID,
    clientSecret: appConfig.AUTH0.CLIENT_SECRET,
    secret: appConfig.AUTH0.SECRET,
    authorizationParams: {
      scope: 'openid profile email',
    },
    routes: {
      login: '/auth/login',
      callback: '/auth/callback',
    },
  });

  return auth(authConfig);
}

module.exports = { createAuthMiddleware };

