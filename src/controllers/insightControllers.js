const { contentfulService } = require('../services');

const getInsights = async (req, res, next) => {
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

module.exports = {
  getInsights,
};
