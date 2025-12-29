/**
 * Controllers for initiating Auth0 login and logout flows.
 */

/**
 * Initiate login flow with optional returnTo parameter.
 * @param req - Express request object
 * @param res - Express response object
 */
function login(req, res) {
  const returnTo = req.query.returnTo || '/dashboard';
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

