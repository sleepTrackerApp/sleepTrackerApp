const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../../src/app');
const { connectDb, disconnectDb } = require('../../src/helpers/db');
const { appConfig } = require('../../src/helpers/settings');
const {
  createMockAuthMiddleware,
  createMockUserSyncMiddleware,
} = require('../helpers/testAuth');

describe('Smoke tests', function () {
  this.timeout(5000);

  let app;

  before(async () => {
    await connectDb(appConfig.MONGODB_URI);
    app = createApp({
      authMiddlewareOption: createMockAuthMiddleware(),
      userSyncMiddlewareOption: createMockUserSyncMiddleware(),
    });
  });

  after(async () => {
    await disconnectDb();
  });

  describe('API health', () => {
    it('GET /api returns welcome message', async () => {
      const res = await request(app).get('/api');

      expect(res.status).to.equal(200);
      expect(res.type).to.match(/json/);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.include('Alive Sleep Tracker API');
    });

    it('GET /api/unknown-route returns 404 with error structure', async () => {
      const res = await request(app).get('/api/this-does-not-exist');

      expect(res.status).to.equal(404);
      expect(res.type).to.match(/json/);
      expect(res.body).to.have.property('success', false);
      expect(res.body.error).to.have.property('code', 'NOT_FOUND');
    });
  });

  describe('Authentication guards', () => {
    it('GET /api/sleep-entries without auth returns 401', async () => {
      const res = await request(app).get('/api/sleep-entries');

      expect(res.status).to.equal(401);
      expect(res.type).to.match(/json/);
      expect(res.body).to.deep.include({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    });

    it('GET /dashboard without auth redirects to login', async () => {
      const res = await request(app).get('/dashboard');

      expect(res.status).to.equal(302);
      expect(res.headers).to.have.property('location');
      expect(res.headers.location).to.match(/^\/auth\/login\?returnTo=/);
    });

    it('GET /api/sleep-entries with auth header returns 200', async () => {
      const res = await request(app)
        .get('/api/sleep-entries')
        .set('x-test-auth', 'true');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('sleepEntries');
    });

    it('GET /dashboard with auth header returns 200', async () => {
      const res = await request(app)
        .get('/dashboard')
        .set('x-test-auth', 'true');

      expect(res.status).to.equal(200);
      expect(res.type).to.match(/html/);
      expect(res.text).to.include('My Sleep History');
    });
  });

  describe('Database connectivity', () => {
    it('can query database', async () => {
      // Try a simple query to verify DB connectivity
      const { SleepEntry } = require('../../src/models');
      const count = await SleepEntry.countDocuments({});

      // Ensure the query doesn't throw - count can be any number
      expect(typeof count).to.equal('number');
      expect(count).to.be.at.least(0);
    });
  });

  describe('Static assets', () => {
    it('serves CSS files', async () => {
      const res = await request(app).get('/css/base.css');
      expect(res.status).to.equal(200);
      expect(res.type).to.equal('text/css');
    });

    it('serves 404 page for unknown routes', async () => {
      const res = await request(app).get('/this-page-does-not-exist');

      expect(res.status).to.equal(404);
      expect(res.type).to.match(/html/);
      expect(res.text).to.include('404');
    });
  });
});
