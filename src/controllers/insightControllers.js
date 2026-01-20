const { contentfulService } = require('../services');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');

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

const fallbackArticles = [
  {
    id: 'fallback-1',
    title: 'How Much Sleep Do You Really Need?',
    slug: 'how-much-sleep-do-you-really-need',
    author: 'Alive Sleep Team',
    date: 'December 18, 2025',
    readTime: '5 min read',
    tags: ['Sleep Science', 'Wellness'],
    excerpt:
      'Recent findings indicate that 40% of people worldwide experience poor sleep, leading to weakened immune function.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-2',
    title: 'The Truth About Insomnia',
    slug: 'the-truth-about-insomnia',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '4 min read',
    tags: ['Sleep', 'Wellness'],
    excerpt:
      'With nearly 29% of the global population suffering from insomnia, understanding the root causes is vital.',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-3',
    title: 'Why Your Bedtime Matters More Than You Think',
    slug: 'why-bedtime-matters',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '3 min read',
    tags: ['Habits'],
    excerpt:
      'Consistency builds healthier circadian rhythms and deeper sleep cycles for better recovery.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-4',
    title: 'Morning Light: The Free Sleep Aid',
    slug: 'morning-light',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '4 min read',
    tags: ['Habits'],
    excerpt:
      'Sunlight within an hour of waking reinforces your body clock and helps you fall asleep faster at night.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-5',
    title: 'Small Screens, Big Impact on Sleep',
    slug: 'screens-and-sleep',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '3 min read',
    tags: ['Wellness'],
    excerpt:
      'Blue light and endless feeds delay melatonin. A 30-minute wind-down can transform your rest.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-6',
    title: 'Caffeine Curfew: How Late Is Too Late?',
    slug: 'caffeine-curfew',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '3 min read',
    tags: ['Nutrition'],
    excerpt:
      'Caffeine has a half-life of up to 6 hours. Cutting off by early afternoon protects your deep sleep.',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-7',
    title: 'Why Short Naps Beat Long Ones',
    slug: 'short-naps',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '2 min read',
    tags: ['Recovery'],
    excerpt:
      'A 20-minute nap can boost alertness without the grogginess of longer daytime sleep.',
    image:
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
  {
    id: 'fallback-8',
    title: 'Sleep and Immunity: The Crucial Link',
    slug: 'sleep-and-immunity',
    author: 'Alive Sleep Team',
    date: 'November 25, 2025',
    readTime: '4 min read',
    tags: ['Immunity'],
    excerpt:
      'Even a single night of poor sleep can reduce natural killer cell activity. Protect your defense system.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
    body: '',
  },
];

const renderInsights = async (req, res, next) => {
  try {
    const articles = await contentfulService.getArticles();
    const list = Array.isArray(articles) && articles.length ? articles : fallbackArticles;
    const featured = list[0];
    const more = list.slice(1);

    return res.render('pages/insights', {
      title: 'Insights',
      activeMenu: 'insights',
      isDashboard: false, // Force landing page navigation
      featured,
      articles: list,
      more,
    });
  } catch (error) {
    next(error);
  }
};

const renderInsightDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const articles = await contentfulService.getArticles();
    const list = Array.isArray(articles) && articles.length ? articles : fallbackArticles;
    
    const article = list.find((a) => a.slug === slug) || list[0];

    if (article && article.bodyContent) {
      article.bodyContent = documentToHtmlString(article.bodyContent);
    }
    const fallbackImage = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80';

    return res.render('pages/insightDetail', {
      title: article.title,
      activeMenu: 'insights',
      isDashboard: false, // Force landing page navigation
      article,
      fallbackImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
  renderInsights,
  renderInsightDetail,
};


