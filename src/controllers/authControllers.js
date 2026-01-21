/**
 * Controllers for initiating Auth0 login and logout flows.
 */

/**
 * Whitelist of allowed redirect paths for security.
 * Only internal paths (starting with '/') are allowed.
 */
const ALLOWED_REDIRECT_PATHS = [
  '/',
  '/dashboard',
  '/home',
];

/**
 * Validates that a returnTo path is safe for redirect.
 * Only allows internal paths (starting with '/') that are in the whitelist.
 * @param {string} path - The path to validate
 * @returns {boolean} - True if the path is safe, false otherwise
 */
function isValidRedirectPath(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Must be an internal path (starts with '/')
  if (!path.startsWith('/')) {
    return false;
  }

  // Must be in the whitelist
  return ALLOWED_REDIRECT_PATHS.includes(path);
}

/**
 * Initiate login flow with optional returnTo parameter.
 * Validates returnTo to prevent open redirect attacks.
 * @param req - Express request object
 * @param res - Express response object
 */
function login(req, res) {
  const requestedReturnTo = req.query.returnTo;
  const returnTo = isValidRedirectPath(requestedReturnTo)
      ? requestedReturnTo
      : '/dashboard'; // Safe default

  res.oidc.login({ returnTo });
}

/**
 * Initiate logout flow.
 * @param req - Express request object
 * @param res - Express response object
 */
function logout(req, res) {
  res.oidc.logout({ returnTo: '/' });
}

module.exports = {
  login,
  logout,
};

