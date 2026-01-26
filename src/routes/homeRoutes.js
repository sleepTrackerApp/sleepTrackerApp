const express = require('express');
const router = express.Router();
const { homeControllers, articleControllers } = require('../controllers');

/* ===============================
   HOME
   =============================== */

   router.get('/', homeControllers.renderHome);
   
/* ===============================
   STATIC PAGES
   =============================== */

router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Us',
    activeMenu: 'about',
  });
});

router.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'Privacy Policy',
    activeMenu: 'privacy',
  });
});

router.get('/terms', (req, res) => {
  res.render('pages/terms', {
    title: 'Terms & Conditions',
    activeMenu: 'terms',
  });
});

/* ===============================
   INSIGHTS (article list & detail pages)
   =============================== */

router.get('/insights', articleControllers.renderArticleList);
router.get('/insights/:slug', articleControllers.renderArticle);

module.exports = router;
