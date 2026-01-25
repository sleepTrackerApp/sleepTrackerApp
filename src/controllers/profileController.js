/**
 * Profile page. Uses requireAuthRoute + res.locals (user, userRecord).
 */
function renderProfile(req, res) {
  res.render('pages/profile', { title: 'Profile', activeSection: 'profile' });
}

/**
 * Support Chat page (profile section).
 */
function renderProfileSupport(req, res) {
  res.render('pages/profileSupport', {
    title: 'Support Chat',
    activeSection: 'support',
    isMessages: true,
  });
}

/**
 * Schedules page (profile section).
 */
function renderProfileSchedules(req, res) {
  res.render('pages/profileSchedules', {
    title: 'Schedules',
    activeSection: 'schedules',
  });
}

module.exports = {
  renderProfile,
  renderProfileSupport,
  renderProfileSchedules,
};
