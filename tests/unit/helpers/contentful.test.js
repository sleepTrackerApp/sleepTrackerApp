const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('Contentful Helper Unit Tests', () => {
  const configuredSettings = {
    appConfig: {
      CONTENTFUL: { SPACE_ID: 'test-space', ACCESS_TOKEN: 'test-token' },
    },
  };
  const unconfiguredSettings = {
    appConfig: {
      CONTENTFUL: { SPACE_ID: '', ACCESS_TOKEN: '' },
    },
  };

  const listItem = {
    sys: { id: '123', createdAt: '2026-01-01T12:00:00Z' },
    fields: {
      title: 'Test Article',
      slug: 'test-article',
      author: 'Author',
      readTime: '5 min',
      excerpt: 'Excerpt.',
      coverImage: { fields: { file: { url: '//images.ctfassets.net/x.jpg' } } },
    },
  };
  const fullItem = {
    ...listItem,
    fields: {
      ...listItem.fields,
      bodyContent: { nodeType: 'document', content: [] },
    },
  };

  let contentfulHelper;
  let mockClient;
  let createClientStub;

  function loadHelper(settingsStub = configuredSettings) {
    delete require.cache[require.resolve('../../../src/helpers/contentful')];
    mockClient = { getEntries: sinon.stub() };
    createClientStub = sinon.stub().returns(mockClient);
    contentfulHelper = proxyquire('../../../src/helpers/contentful', {
      './settings': settingsStub,
      contentful: { createClient: createClientStub },
    });
  }

  afterEach(() => {
    sinon.restore();
  });

  describe('isContentfulConfigured', () => {
    it('returns true when CONTENTFUL has SPACE_ID and ACCESS_TOKEN', () => {
      loadHelper(configuredSettings);
      expect(contentfulHelper.isContentfulConfigured()).to.be.true;
    });

    it('returns false when CONTENTFUL has empty credentials', () => {
      loadHelper(unconfiguredSettings);
      expect(contentfulHelper.isContentfulConfigured()).to.be.false;
    });
  });

  describe('getArticleList', () => {
    it('calls client.getEntries with list query and returns mapped articles', async () => {
      loadHelper();
      mockClient.getEntries.resolves({ items: [listItem] });

      const result = await contentfulHelper.getArticleList();

      expect(createClientStub.calledOnce).to.be.true;
      expect(mockClient.getEntries.calledOnce).to.be.true;
      expect(mockClient.getEntries.firstCall.args[0]).to.deep.equal({
        content_type: 'articles',
        order: '-fields.date',
        select:
          'sys.id,fields.slug,fields.title,fields.author,fields.date,fields.readTime,fields.tags,fields.excerpt,fields.coverImage',
      });
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.include({
        id: '123',
        title: 'Test Article',
        slug: 'test-article',
        image: 'https://images.ctfassets.net/x.jpg',
      });
      expect(result[0].bodyContent).to.be.undefined;
    });

    it('returns empty array when Contentful is not configured', async () => {
      loadHelper(unconfiguredSettings);

      const result = await contentfulHelper.getArticleList();

      expect(createClientStub.notCalled).to.be.true;
      expect(result).to.be.an('array').that.is.empty;
    });

    it('returns empty array and logs when API throws', async () => {
      loadHelper();
      mockClient.getEntries.rejects(new Error('Network error'));
      const consoleStub = sinon.stub(console, 'error');

      const result = await contentfulHelper.getArticleList();

      expect(result).to.be.an('array').that.is.empty;
      expect(consoleStub.calledOnce).to.be.true;
      expect(consoleStub.firstCall.args[0]).to.include(
        'Error fetching Contentful articles'
      );
    });
  });

  describe('getArticleBySlug', () => {
    it('calls client.getEntries with slug filter and returns mapped article with bodyContent', async () => {
      loadHelper();
      mockClient.getEntries.resolves({ items: [fullItem] });

      const result = await contentfulHelper.getArticleBySlug('test-article');

      expect(
        mockClient.getEntries.calledOnceWith({
          content_type: 'articles',
          'fields.slug': 'test-article',
        })
      ).to.be.true;
      expect(result).to.not.be.null;
      expect(result.title).to.equal('Test Article');
      expect(result.slug).to.equal('test-article');
      expect(result.bodyContent).to.deep.equal(fullItem.fields.bodyContent);
    });

    it('returns null for empty or non-string slug without calling API', async () => {
      loadHelper();

      expect(await contentfulHelper.getArticleBySlug('')).to.be.null;
      expect(await contentfulHelper.getArticleBySlug(null)).to.be.null;
      expect(await contentfulHelper.getArticleBySlug(123)).to.be.null;

      expect(mockClient.getEntries.notCalled).to.be.true;
    });

    it('returns null when Contentful is not configured', async () => {
      loadHelper(unconfiguredSettings);

      const result = await contentfulHelper.getArticleBySlug('any-slug');

      expect(createClientStub.notCalled).to.be.true;
      expect(result).to.be.null;
    });

    it('returns null when no entry is found', async () => {
      loadHelper();
      mockClient.getEntries.resolves({ items: [] });

      const result = await contentfulHelper.getArticleBySlug('missing');

      expect(result).to.be.null;
    });

    it('returns null and logs when API throws', async () => {
      loadHelper();
      mockClient.getEntries.rejects(new Error('Unreachable'));
      const consoleStub = sinon.stub(console, 'error');

      const result = await contentfulHelper.getArticleBySlug('any-slug');

      expect(result).to.be.null;
      expect(consoleStub.firstCall.args[0]).to.include(
        'Error fetching Contentful article by slug'
      );
    });
  });
});
