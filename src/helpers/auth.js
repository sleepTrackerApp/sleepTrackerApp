/**
 * Auth0 configuration helpers and middleware wiring.
 */

const { auth } = require('express-openid-connect');
const { appConfig } = require('./settings');
const userService = require('../services/userService');

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
 * Determine whether the current session is authenticated.
 * Ensures function does not crash if data are not available.
 * @param res - The response object with session data.
 * @returns {boolean} - True if authenticated, false otherwise.
 */
function isAuthenticated(res) {
  // Return isAuthenticated from res.locals if available
  if (typeof res?.locals?.isAuthenticated === 'boolean') {
    return res.locals.isAuthenticated;
  }
  // Otherwise return false
  return false;
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
    // Flag if user is authenticated
    res.locals.isAuthenticated = isAuthenticated;
    // Raw user object from Auth0 if authenticated
    res.locals.user = isAuthenticated ? req.oidc.user : null;
    // User Display name if authenticated
    res.locals.displayName = isAuthenticated ? getDisplayName(req.oidc.user) : null;
    // User profile with non-sensitive info if authenticated
    res.locals.userProfile = isAuthenticated ? buildUserProfile(req.oidc.user) : null;
    // User record from application database (will be created later)
    res.locals.userRecord = null;
    // Flag indicating if this is the user's first login
    res.locals.isFirstLogin = false;

    // If not authenticated, proceed to next middleware
    if (!isAuthenticated) {
      return next();
    }

    // Retrieve or create the user record in a single atomic operation
    const userRecord = await userService.getOrCreateUser(req.oidc.user.sub);
    res.locals.userRecord = userRecord;
    // Determine if this is the first login based on timestamps, if available
    res.locals.isFirstLogin =
      userRecord?.createdAt instanceof Date &&
      userRecord?.updatedAt instanceof Date &&
      userRecord.createdAt.getTime() === userRecord.updatedAt.getTime();

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
    baseURL: appConfig.BASE_URL,
    clientID: appConfig.AUTH0.CLIENT_ID,
    clientSecret: appConfig.AUTH0.CLIENT_SECRET,
    secret: appConfig.AUTH0.SECRET,
    authorizationParams: {
      response_type: 'code',
      response_mode: 'query',
      scope: 'openid profile email',
    },
    routes: {
      login: false,
      logout: false,
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

/**
 * Require auth for API routes: respond with a consistent 401 JSON error.
 * Usage: router.get('/api/user', requireAuthAPI, apiControllerFn)
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
function requireAuthAPI(req, res, next) {
  if (isAuthenticated(res)) return next();

  return res.status(401).json({
    success: false,
    error: {
      code: 'AUTH_REQUIRED',
      message: 'Authentication required',
    },
  });
}

/**
 * Require auth for page routes: redirect to /auth/login if not authentificated.
 * Usage: router.get('/dashboard', requireAuthRoute, pageControllerFn)
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
function requireAuthRoute(req, res, next) {
  if (isAuthenticated(res)) return next();

  const returnTo = encodeURIComponent(req.originalUrl || '/dashboard');
  return res.redirect(`/auth/login?returnTo=${returnTo}`);
}

module.exports = {
  createAuthMiddleware,
  buildAuthConfig,
  userSyncMiddleware,
  requireAuthAPI,
  requireAuthRoute,
};
