/**
 * Auth0 configuration helpers and middleware wiring.
 */

const { auth } = require('express-openid-connect');
const { appConfig } = require('./settings');
const userService = require('../services/userService');

/**
 * Extract a human-friendly display name for the authenticated user.
 */
function getDisplayName(user) {
  return user?.name || user?.email || null;
}

/**
 * Construct a profile object with non-sensitive user information.
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
 * Synchronize authenticated user with database.
 */
async function userSyncMiddleware(req, res, next) {
  try {
    const isAuthenticated = Boolean(req.oidc?.isAuthenticated?.() && req.oidc.user);

    res.locals.isAuthenticated = isAuthenticated;
    res.locals.user = isAuthenticated ? req.oidc.user : null;
    res.locals.displayName = isAuthenticated ? getDisplayName(req.oidc.user) : null;
    res.locals.userProfile = isAuthenticated ? buildUserProfile(req.oidc.user) : null;
    res.locals.userRecord = null;
    res.locals.isFirstLogin = false;

    if (!isAuthenticated) {
      return next();
    }

    // Create or retrieve user record
    const userRecord = await userService.getOrCreateUser(req.oidc.user.sub);
    res.locals.userRecord = userRecord;

    // Detect first login by comparing timestamps
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
 * Build Auth0 configuration object for express-openid-connect.
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
 * Auth0 middleware factory.
 */
function createAuthMiddleware() {
  return auth(buildAuthConfig());
}

/**
 * Require authentication for API routes.
 */
function requireAuthAPI(req, res, next) {
  if (res.locals.isAuthenticated) return next();

  return res.status(401).json({
    success: false,
    error: {
      code: 'AUTH_REQUIRED',
      message: 'Authentication required',
    },
  });
}

/**
 * Require authentication for page routes.
 */
function requireAuthRoute(req, res, next) {
  if (res.locals.isAuthenticated) return next();

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
