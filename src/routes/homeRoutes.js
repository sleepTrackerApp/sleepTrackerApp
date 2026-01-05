const express = require('express');
const router = express.Router();

/* ===============================
   HOME
   =============================== */

router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Home',
    activeMenu: 'home',
  });
});

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

module.exports = router;
