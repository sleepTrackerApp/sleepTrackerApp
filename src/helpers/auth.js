/**
 * Auth0 configuration helpers and middleware wiring.
 */

const { auth } = require('express-openid-connect');
const { appConfig } = require('./settings');
const userService = require('../services/userService');

/**
 * Resolve the base URL for the application, appending port if necessary.
 * @returns {string} - The resolved base URL.
 */
function resolveBaseUrl() {
  const url = new URL(appConfig.BASE_URL);
  if (!url.port && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    url.port = appConfig.PORT.toString();
  }
  return url.toString().replace(/\/+$/, '');
}

/**
 * Extract a human-friendly display name for the authenticated user.
 * @param user {object} - The authenticated user object.
 * @returns {*|null} - The display name or null if not available.
 */
function getDisplayName(user) {
  return user?.name || user?.email || null;
}

/**
 * Construct a profile object with non-sensitive user information.
 * @param user - The authenticated user object.
 * @returns {{sub: *, email, name}|null} - The profile or null if user is not provided.
 */
function buildUserProfile(user) {
  if (!user) return null;
  const { sub, email, name } = user;
  return {
    sub,
    email: email || null,
    name: name || null,
  };
}

/**
 * Middleware to synchronize authenticated user with application user records.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns {Promise<*>} - Proceeds to the next middleware.
 */
async function userSyncMiddleware(req, res, next) {
  try {
    // Determine if the user is authenticated
    const isAuthenticated = Boolean(req.oidc?.isAuthenticated?.() && req.oidc.user);

    // Set local variables for use in views and downstream middleware
    res.locals.isAuthenticated = isAuthenticated;
    res.locals.user = isAuthenticated ? req.oidc.user : null;
    res.locals.displayName = isAuthenticated ? getDisplayName(req.oidc.user) : null;
    res.locals.userProfile = isAuthenticated ? buildUserProfile(req.oidc.user) : null;
    res.locals.userRecord = null;
    res.locals.isFirstLogin = false;

    // If not authenticated, proceed to next middleware
    if (!isAuthenticated) {
      return next();
    }

    // Attempt to find an existing user record by Auth0 user ID
    const existing = await userService.findUserByAuthId(req.oidc.user.sub);
    // If found, attach it
    if (existing) {
      res.locals.userRecord = existing;
    } else {
      // If not found, create a new user record
      res.locals.userRecord = await userService.getOrCreateUser(req.oidc.user.sub);
      res.locals.isFirstLogin = true;
    }

    return next();
  } catch (error) {
    console.error('Failed to sync user record', error);
    return next(error);
  }
}

/**
 * Build the Auth0 configuration object.
 * @returns {object} - The Auth0 configuration.
 */
function buildAuthConfig() {
  return {
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: appConfig.AUTH0.ISSUER_BASE_URL,
    baseURL: resolveBaseUrl(),
    clientID: appConfig.AUTH0.CLIENT_ID,
    clientSecret: appConfig.AUTH0.CLIENT_SECRET,
    secret: appConfig.AUTH0.SECRET,
    authorizationParams: {
      response_type: 'code',
      response_mode: 'query',
      scope: 'openid profile email',
    },
    routes: {
      login: '/auth/login',
      callback: '/auth/callback',
    },
  };
}

/**
 * Create the Auth0 authentication middleware.
 * @returns {function} - The Auth0 authentication middleware.
 */
function createAuthMiddleware() {
  return auth(buildAuthConfig());
}

module.exports = {
  createAuthMiddleware,
  buildAuthConfig,
  userSyncMiddleware,
};