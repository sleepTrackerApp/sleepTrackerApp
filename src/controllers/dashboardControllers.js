/**
 * Dashboard controller responsible for rendering authenticated user pages.
 */

/**
 * Dashboard page handler.
 * @param req - Express request object
 * @param res - Express response object
 * @returns {*} - Renders dashboard or redirects to login
 */
function renderDashboard(req, res) {
  // Check authentication status
  const isAuthenticated = Boolean(req.oidc?.isAuthenticated?.() && req.oidc.user);

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return res.redirect('/auth/login');
  }

  // Get display name from res.locals set by middleware
  const displayName = res.locals?.displayName || 'User';

  // Render the dashboard page for authenticated users
  return res.render('pages/dashboard', {
    title: 'My Sleep Data',
    activeMenu: 'dashboard',
    displayName,
    isAuthenticated: true,
  });
}

module.exports = {
  renderDashboard,
};

