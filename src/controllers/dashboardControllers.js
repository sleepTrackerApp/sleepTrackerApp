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

  // Render the dashboard page for authenticated users
  return res.render('pages/dashboard', {
    title: 'My Sleep Data',
    activeMenu: 'log',
  });
}

/**
 * Schedules page handler.
 * @param req - Express request object
 * @param res - Express response object
 * @returns {*} - Renders schedules page
 */
function renderSchedules(req, res) {
  return res.render('pages/schedules', {
    title: 'My Sleep Schedules',
    activeMenu: 'schedules'
  });
}

module.exports = {
  renderDashboard,
  renderSchedules,
};

