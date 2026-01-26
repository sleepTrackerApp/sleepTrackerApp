/**
 * Contentful SDK integration helper
 */

const contentful = require('contentful');
const { appConfig } = require('./settings');

// Fields to select for article list (no bodyContent)
const LIST_FIELDS =
  'sys.id,fields.slug,fields.title,fields.author,fields.date,fields.readTime,fields.tags,fields.excerpt,fields.coverImage';

/**
 * Check if Contentful is properly configured (space and token set).
 * @returns {boolean} True if configured, false otherwise.
 */
function isContentfulConfigured() {
  const c = appConfig.CONTENTFUL;
  return !!(c && c.SPACE_ID && c.ACCESS_TOKEN);
}

// Singleton Contentful client variable
let client = null;

/**
 * Function to get or create the Contentful client.
 * Ensures a single instance is used.
 * @returns {import("contentful").ContentfulClientApi|undefined} - Contentful client instance or undefined if unconfigured.
 */
function getClient() {
  if (!client && isContentfulConfigured()) {
    client = contentful.createClient({
      space: appConfig.CONTENTFUL.SPACE_ID,
      accessToken: appConfig.CONTENTFUL.ACCESS_TOKEN,
    });
  }
  return client;
}

/**
 * Function to map a Contentful entry item to an article object.
 * @param {import("contentful").Entry} item - Contentful entry item.
 * @returns {{ id, title, slug, author, date, readTime, tags, excerpt, image, bodyContent }} - Mapped article object.
 */
function mapItemToArticle(item) {
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
    bodyContent: item.fields.bodyContent,
  };
}

/**
 * Function to fetch a list of all articles.
 * Gracefully handles unconfigured state and API errors.
 * @returns {Promise<Array<{ id, title, slug, author, date, readTime, tags, excerpt, image }>>} - Array of article objects.
 */
async function getArticleList() {
  if (!isContentfulConfigured()) return [];
  try {
    const response = await getClient().getEntries({
      content_type: 'articles',
      order: '-fields.date',
      select: LIST_FIELDS,
    });
    return (response.items || []).map(mapItemToArticle);
  } catch (error) {
    console.error('Error fetching Contentful articles:', error);
    return [];
  }
}

/**
 * Function to fetch a single article by slug.
 * Gracefully handles unconfigured state and API errors.
 * @param {string} slug - Article slug.
 * @returns {Promise<{ id, title, slug, author, date, readTime, tags, excerpt, image, bodyContent }|null>} - Article object or null.
 */
async function getArticleBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  if (!isContentfulConfigured()) return null;
  try {
    const response = await getClient().getEntries({
      content_type: 'articles',
      'fields.slug': slug,
    });
    const item = response.items && response.items[0];
    return item ? mapItemToArticle(item) : null;
  } catch (error) {
    console.error('Error fetching Contentful article by slug:', error);
    return null;
  }
}

module.exports = { isContentfulConfigured, getArticleList, getArticleBySlug };
