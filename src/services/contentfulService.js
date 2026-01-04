const contentful = require('contentful');

// Initialise the Client
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID || 'test-space-id',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || 'test-access-token'
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
        body: item.fields.bodyContent
      };
    });

    return cleanArticles;

  } catch (error) {
    console.error('Error fetching Contentful articles:', error);
    return [];
  }
};

module.exports = { getArticles };