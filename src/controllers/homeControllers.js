/**
 * Home page controller handlers.
 */
function renderHome(req, res) {
  res.render('pages/home', {
    title: 'Wake Up Truly Alive',
    activeMenu: 'home',
  });
}

module.exports = {
  renderHome,
};

