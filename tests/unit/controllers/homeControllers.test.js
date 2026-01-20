const { expect } = require('chai');
const sinon = require('sinon');
const { renderHome } = require('../../../src/controllers/homeControllers');
const { contentfulService } = require('../../../src/services');

describe('Home controller tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('renders home page with correct title and activeMenu', async () => {
    const req = {};
    const res = {
      render: sinon.stub(),
    };

    const getArticlesStub = sinon.stub(contentfulService, 'getArticles').resolves([
      { title: 'Article 1', slug: 'a1', image: 'img1.jpg', excerpt: '...' },
      { title: 'Article 2', slug: 'a2', image: 'img2.jpg', excerpt: '...' }
    ]);

    await renderHome(req, res);

    expect(
      res.render.calledOnceWithExactly('pages/home', {
        title: 'Wake Up Truly Alive',
        activeMenu: 'home',
        isDashboard: false,
        articles: [
          { title: 'Article 1', slug: 'a1', image: 'img1.jpg', excerpt: '...' },
          { title: 'Article 2', slug: 'a2', image: 'img2.jpg', excerpt: '...' }
        ]
      })
    ).to.be.true;
  });
});

