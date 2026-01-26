/**
 * Article Controllers
 * Handles fetching and rendering articles from Contentful
 */

const { contentfulService } = require('../services');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');

/**
 * Fetches a list of articles from Contentful and sends as JSON response.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<void>} - JSON response with articles data
 */
const getArticles = async (req, res, next) => {
  try {
    const articles = await contentfulService.getArticles();

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches articles and renders the article list page.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<*>} - Rendered article list page
 */
const renderArticleList = async (req, res, next) => {
  try {
    const list = await contentfulService.getArticles();
    const featured = list[0];
    const more = list.slice(1);

    return res.render('pages/insights', {
      title: 'Insights',
      activeMenu: 'insights',
      featured,
      articles: list,
      more,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches a single article by slug and renders the article detail page.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<*>} - Rendered article detail page
 */
const renderArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await contentfulService.getArticleBySlug(slug);
    if (!article) {
      return next({ statusCode: 404, message: 'Article not found' });
    }

    if (article.bodyContent) {
      article.bodyContent = documentToHtmlString(article.bodyContent);
    }
    const fallbackImage =
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80';

    return res.render('pages/insightDetail', {
      title: article.title,
      activeMenu: 'insights',
      article,
      fallbackImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  renderArticleList,
  renderArticle,
};
