const contentful = require('contentful');
const { appConfig } = require('../helpers/settings');

const client = contentful.createClient({
  space: appConfig.CONTENTFUL.SPACE_ID,
  accessToken: appConfig.CONTENTFUL.ACCESS_TOKEN,
});

const getArticles = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'articles',
      order: '-fields.date'
    });

    const cleanArticles = response.items.map((item) => {
      const imageUrl = item.fields.coverImage?.fields?.file?.url 
        ? 'https:' + item.fields.coverImage.fields.file.url 
        : null;

      return {
        id: item.sys.id,
        title: item.fields.title,
        slug: item.fields.slug,
        author: item.fields.author,
        date: item.fields.date,
        readTime: item.fields.readTime,
        tags: item.fields.tags,
        excerpt: item.fields.excerpt,
        image: imageUrl,
        bodyContent: item.fields.bodyContent
      };
    });

    return cleanArticles;

  } catch (error) {
    console.error('Error fetching Contentful articles:', error);
    return [];
  }
};

module.exports = { getArticles };