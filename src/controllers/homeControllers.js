/**
 * Home page controller handlers.
 */
const { contentfulService } = require('../services');

/**
 * Fallback articles to ensure the Home page Section 3 always has content.
 * These match the first two items in your insightController fallbacks.
 */
const fallbackArticles = [
  {
    id: 'fallback-1',
    title: 'How Much Sleep Do You Really Need?',
    slug: 'how-much-sleep-do-you-really-need',
    date: 'December 18, 2025',
    excerpt: 'Recent findings indicate that 40% of people worldwide experience poor sleep, leading to weakened immune function.',
    image: '/img/Article (1).jpg',
  },
  {
    id: 'fallback-2',
    title: 'The Truth About Insomnia',
    slug: 'the-truth-about-insomnia',
    date: 'November 25, 2025',
    excerpt: 'With nearly 29% of the global population suffering from insomnia, understanding the root causes is vital.',
    image: '/img/Article (2).jpg',
  }
];

const renderHome = async (req, res, next) => {
  try {
    // Fetch articles from the service 
    const articles = await contentfulService.getArticles();
    
    // Check if we have dynamic data; if not, use the top 2 fallback articles 
    const list = Array.isArray(articles) && articles.length 
      ? articles.slice(0, 2) 
      : fallbackArticles;

    res.render('pages/home', {
      title: 'Wake Up Truly Alive',
      activeMenu: 'home',
      isDashboard: false, // Force landing page navigation
      articles: list, // This provides the variable home.ejs is looking for 
    });
  } catch (error) {
    // Pass the error to the global error handler 
    next(error);
  }
};

module.exports = {
  renderHome,
};