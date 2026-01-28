/**
 * Auth helpers for integration tests.
 * Provides lightweight mock Auth0-style middleware and guards that
 * work with the app's expectations (res.locals.isAuthenticated, userRecord, etc).
 */

const DEFAULT_TEST_USER_ID = '507f1f77bcf86cd799439011'; // Custom MongoDB ObjectId
const DEFAULT_HEADER_NAME = 'x-test-auth'; // Custom header name to simulate auth
const DEFAULT_HEADER_VALUE = 'true'; // Custom header value to simulate auth

/**
 * Create a mock auth middleware that expects a custom header as an auth token.
 * Sets res.locals.isAuthenticated and res.locals.userRecord accordingly.
 * @returns {function} Express middleware function
 */
function createMockAuthMiddleware() {
  return (req, res, next) => {
    if (req.headers[DEFAULT_HEADER_NAME] === DEFAULT_HEADER_VALUE) {
      res.locals.isAuthenticated = true;
      res.locals.displayName = 'Test User';
      res.locals.userRecord = { _id: DEFAULT_TEST_USER_ID };
      res.locals.userProfile = {
        sub: DEFAULT_TEST_USER_ID,
        name: 'Test User',
        email: 'test@test.com',
      };
      res.locals.isFirstLogin = false;
    } else {
      res.locals.isAuthenticated = false;
      res.locals.displayName = null;
      res.locals.userRecord = null;
      res.locals.userProfile = null;
      res.locals.isFirstLogin = false;
    }
    next();
  };
}

/**
 * Stib user sync middleware for tests.
 * The real app uses this to sync the Auth0 user with Mongo;
 * In tests this work is already done in the mock auth middleware.
 */
function createMockUserSyncMiddleware() {
  return (req, res, next) => next();
}

module.exports = {
  DEFAULT_TEST_USER_ID,
  createMockAuthMiddleware,
  createMockUserSyncMiddleware,
};
