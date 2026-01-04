const sinon = require('sinon');
const { expect } = require('chai');
const contentful = require('contentful');

describe('Contentful Service Unit Tests', () => {
  let getArticles;
  let mockClient;
  let createClientStub;

  before(() => {
    // 1. Create a fake client
    mockClient = { getEntries: sinon.stub() };

    // 2. Intercept the real 'createClient' call
    createClientStub = sinon.stub(contentful, 'createClient').returns(mockClient);

    // 3. Clear cache to reload service with the mocked client
    delete require.cache[require.resolve('../../../src/services/contentfulService')];
    
    // 4. Load the service
    const service = require('../../../src/services/contentfulService');
    getArticles = service.getArticles;
  });

  after(() => {
    createClientStub.restore();
  });

  // Reset the mock behavior before each test to prevent cross-contamination
  afterEach(() => {
    mockClient.getEntries.reset();
  });

  it('should fetch and format articles correctly (Success Case)', async () => {
    const mockResponse = {
      items: [
        {
          sys: { id: '123', createdAt: '2025-01-01T12:00:00Z' },
          fields: {
            title: 'Test Sleep Article',
            slug: 'test-sleep-article',
            author: 'Mi Vo',
            readTime: '5 min',
            excerpt: 'Testing is important.',
            bodyContent: { data: {} },
            coverImage: {
              fields: { file: { url: '//images.ctfassets.net/example.jpg' } }
            }
          },
        },
      ],
    };

    mockClient.getEntries.resolves(mockResponse);

    const result = await getArticles();

    expect(result).to.have.lengthOf(1);
    expect(result[0].title).to.equal('Test Sleep Article');
    expect(result[0].image).to.equal('https://images.ctfassets.net/example.jpg');
  });

  it('should return empty array gracefully and log error if API fails (Error Case)', async () => {
    const consoleSpy = sinon.stub(console, 'error');

    // A. ARRANGE: Force an error
    mockClient.getEntries.rejects(new Error('Network Error'));

    // B. ACT
    const result = await getArticles();

    // C. ASSERT
    // Check 1: Did we get the empty array?
    expect(result).to.be.an('array').that.is.empty;

    // Check 2: Did the service actually catch and log the error?
    expect(consoleSpy.calledOnce).to.be.true;
    
    // Optional: Check if the log message contains the text you expect
    const loggedError = consoleSpy.firstCall.args[0]; 
    expect(loggedError).to.include('Error fetching Contentful articles');

    // CLEANUP: Restore console.error so other tests show errors normally
    consoleSpy.restore();
  });
});