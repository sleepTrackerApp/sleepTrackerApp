const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('Contentful Service Unit Tests', () => {
  const mockArticle = {
    id: '123',
    title: 'Test Sleep Article',
    slug: 'test-sleep-article',
    image: 'https://images.ctfassets.net/example.jpg',
  };
  const mockList = [mockArticle];

  let getArticles;
  let getArticleBySlug;
  let getArticleListStub;
  let getArticleBySlugStub;
  let isContentfulConfiguredStub;

  before(() => {
    getArticleListStub = sinon.stub().resolves(mockList);
    getArticleBySlugStub = sinon.stub().resolves(mockArticle);
    isContentfulConfiguredStub = sinon.stub().returns(true);
    const contentfulService = proxyquire('../../../src/services/contentfulService', {
      '../helpers/contentful': {
        isContentfulConfigured: isContentfulConfiguredStub,
        getArticleList: getArticleListStub,
        getArticleBySlug: getArticleBySlugStub,
      },
    });
    getArticles = contentfulService.getArticles;
    getArticleBySlug = contentfulService.getArticleBySlug;
  });

  afterEach(() => {
    getArticleListStub.reset();
    getArticleBySlugStub.reset();
    isContentfulConfiguredStub.reset();
    getArticleListStub.resolves(mockList);
    getArticleBySlugStub.resolves(mockArticle);
    isContentfulConfiguredStub.returns(true);
  });

  describe('getArticles', () => {
    it('calls helper getArticleList and returns its result', async () => {
      const result = await getArticles();

      expect(getArticleListStub.calledOnce).to.be.true;
      expect(result).to.equal(mockList);
      expect(result).to.have.lengthOf(1);
      expect(result[0].title).to.equal('Test Sleep Article');
    });

    it('returns fallback list when not configured without calling helper', async () => {
      isContentfulConfiguredStub.returns(false);

      const result = await getArticles();

      expect(isContentfulConfiguredStub.calledOnce).to.be.true;
      expect(getArticleListStub.notCalled).to.be.true;
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0].title).to.equal('How Much Sleep Do You Really Need?');
      expect(result[0].slug).to.equal('how-much-sleep-do-you-really-need');
    });

    it('returns fallback list when helper returns empty array', async () => {
      getArticleListStub.resolves([]);

      const result = await getArticles();

      expect(getArticleListStub.calledOnce).to.be.true;
      expect(result).to.be.an('array').that.is.not.empty;
      expect(result[0].title).to.equal('How Much Sleep Do You Really Need?');
      expect(result[0].slug).to.equal('how-much-sleep-do-you-really-need');
    });
  });

  describe('getArticleBySlug', () => {
    it('validates slug and calls helper when slug is valid', async () => {
      const result = await getArticleBySlug('test-sleep-article');

      expect(getArticleBySlugStub.calledOnceWith('test-sleep-article')).to.be.true;
      expect(result).to.equal(mockArticle);
    });

    it('returns null without calling helper for empty slug', async () => {
      const result = await getArticleBySlug('');

      expect(getArticleBySlugStub.notCalled).to.be.true;
      expect(result).to.be.null;
    });

    it('returns null without calling helper for null slug', async () => {
      const result = await getArticleBySlug(null);

      expect(getArticleBySlugStub.notCalled).to.be.true;
      expect(result).to.be.null;
    });

    it('returns null without calling helper for non-string slug', async () => {
      const result = await getArticleBySlug(123);

      expect(getArticleBySlugStub.notCalled).to.be.true;
      expect(result).to.be.null;
    });

    it('returns fallback article when not configured without calling helper', async () => {
      isContentfulConfiguredStub.returns(false);

      const result = await getArticleBySlug('how-much-sleep-do-you-really-need');

      expect(isContentfulConfiguredStub.calledOnce).to.be.true;
      expect(getArticleBySlugStub.notCalled).to.be.true;
      expect(result).to.not.be.null;
      expect(result.slug).to.equal('how-much-sleep-do-you-really-need');
      expect(result.title).to.equal('How Much Sleep Do You Really Need?');
    });

    it('returns null when configured and helper returns null (caller should 404)', async () => {
      getArticleBySlugStub.resolves(null);

      const result = await getArticleBySlug('nonexistent-slug');

      expect(getArticleBySlugStub.calledOnceWith('nonexistent-slug')).to.be.true;
      expect(result).to.be.null;
    });
  });
});
