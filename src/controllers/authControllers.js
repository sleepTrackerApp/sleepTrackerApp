/**
 * Controllers for initiating Auth0 login and logout flows.
 */

const userService = require('../services/userService');

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
 * Simple email/password login handler (for development/testing).
 * In production, use proper auth0 flow.
 * @param req - Express request object
 * @param res - Express response object
 */
async function emailPasswordLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).render('pages/signin', { error: 'Email and password required' });
    }

    // For now, accept any email/password combo (simple authentication)
    if (email && password.length >= 3) {
      // Store in session
      if (!req.session) req.session = {};
      req.session.userId = email;
      req.session.user = {
        email,
        name: email.split('@')[0],
      };

      console.log('[Auth] User logged in:', email);
      return res.redirect('/dashboard');
    }

    return res.status(401).render('pages/signin', { error: 'Invalid credentials' });
  } catch (error) {
    console.error('[Auth] Email/password login error:', error);
    return res.status(500).render('pages/signin', { error: 'Login failed: ' + error.message });
  }
}

/**
 * Initiate logout flow.
 * @param req - Express request object
 * @param res - Express response object
 */
function logout(req, res) {
  if (req.oidc && req.oidc.logout) {
    res.oidc.logout({ returnTo: '/' });
  } else {
    // For non-OIDC logout
    req.session = null;
    res.redirect('/');
  }
}

module.exports = {
  login,
  emailPasswordLogin,
  logout,
};


