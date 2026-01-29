const { expect } = require('chai');
const sinon = require('sinon');
const {
  buildAuthConfig,
  userSyncMiddleware,
  requireAuthAPI,
  requireAuthRoute,
} = require('../../../src/helpers/auth');
const userService = require('../../../src/services/userService');

describe('Auth helpers', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(userService, 'getOrCreateUser');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('buildAuthConfig', () => {
    it('creates config with custom routes disabled', () => {
      const config = buildAuthConfig();
      expect(config.authRequired).to.be.false;
      expect(config.auth0Logout).to.be.true;
      expect(config.routes).to.deep.equal({
        login: false,
        logout: false,
        callback: '/auth/callback',
      });
    });
  });

  describe('userSyncMiddleware', () => {
    it('skips when unauthenticated', async () => {
      const req = { oidc: { isAuthenticated: () => false } };
      const res = { locals: {} };
      const next = sinon.stub();
      await userSyncMiddleware(req, res, next);
      expect(res.locals.isAuthenticated).to.be.false;
      expect(userService.getOrCreateUser.called).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('creates user on first login', async () => {
      const req = {
        oidc: {
          isAuthenticated: () => true,
          user: { sub: 'auth0|new-user', name: 'Tester' },
        },
      };
      const res = { locals: {} };
      const next = sinon.stub();
      const newUserRecord = {
        authIdHash: 'hash',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };
      userService.getOrCreateUser.resolves(newUserRecord);
      await userSyncMiddleware(req, res, next);
      expect(
        userService.getOrCreateUser.calledOnceWithExactly('auth0|new-user')
      ).to.be.true;
      expect(res.locals.userRecord).to.deep.equal(newUserRecord);
      expect(res.locals.isFirstLogin).to.be.true;
      expect(next.calledOnce).to.be.true;
    });

    it('populates locals and reuses existing user', async () => {
      const req = {
        oidc: {
          isAuthenticated: () => true,
          user: { sub: 'auth0|existing', name: 'Tester' },
        },
      };
      const res = { locals: {} };
      const next = sinon.stub();
      const existingRecord = {
        authIdHash: 'hash',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      };
      userService.getOrCreateUser.resolves(existingRecord);
      await userSyncMiddleware(req, res, next);
      expect(res.locals.isAuthenticated).to.be.true;
      expect(res.locals.userRecord).to.deep.equal(existingRecord);
      expect(res.locals.isFirstLogin).to.be.false;
      expect(
        userService.getOrCreateUser.calledOnceWithExactly('auth0|existing')
      ).to.be.true;
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('requireAuthAPI', () => {
    it('calls next() when user is authenticated', () => {
      const req = {};
      const res = {
        locals: { isAuthenticated: true },
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthAPI(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(res.status.called).to.be.false;
      expect(res.json.called).to.be.false;
    });

    it('returns 401 JSON error when user is not authenticated', () => {
      const req = {};
      const res = {
        locals: { isAuthenticated: false },
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthAPI(req, res, next);

      expect(next.called).to.be.false;
      expect(res.status.calledOnceWithExactly(401)).to.be.true;
      expect(
        res.json.calledOnceWithExactly({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        })
      ).to.be.true;
    });

    it('returns 401 when isAuthenticated is undefined in res.locals', () => {
      const req = {};
      const res = {
        locals: {},
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthAPI(req, res, next);

      expect(next.called).to.be.false;
      expect(res.status.calledOnceWithExactly(401)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  describe('requireAuthRoute', () => {
    it('calls next() when user is authenticated', () => {
      const req = {
        originalUrl: '/dashboard',
      };
      const res = {
        locals: { isAuthenticated: true },
        redirect: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthRoute(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(res.redirect.called).to.be.false;
    });

    it('redirects to /auth/login with returnTo parameter when user is not authenticated', () => {
      const req = {
        originalUrl: '/dashboard',
      };
      const res = {
        locals: { isAuthenticated: false },
        redirect: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthRoute(req, res, next);

      expect(next.called).to.be.false;
      expect(
        res.redirect.calledOnceWithExactly('/auth/login?returnTo=%2Fdashboard')
      ).to.be.true;
    });

    it('uses /dashboard as default returnTo when originalUrl is missing', () => {
      const req = {};
      const res = {
        locals: { isAuthenticated: false },
        redirect: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthRoute(req, res, next);

      expect(next.called).to.be.false;
      expect(
        res.redirect.calledOnceWithExactly('/auth/login?returnTo=%2Fdashboard')
      ).to.be.true;
    });

    it('properly encodes returnTo URL with special characters', () => {
      const req = {
        originalUrl: '/dashboard?filter=test&sort=date',
      };
      const res = {
        locals: { isAuthenticated: false },
        redirect: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthRoute(req, res, next);

      expect(next.called).to.be.false;
      expect(res.redirect.calledOnce).to.be.true;
      const redirectUrl = res.redirect.getCall(0).args[0];
      expect(redirectUrl).to.include('/auth/login?returnTo=');
      expect(redirectUrl).to.include(
        encodeURIComponent('/dashboard?filter=test&sort=date')
      );
    });

    it('returns 401 when isAuthenticated is undefined in res.locals', () => {
      const req = {
        originalUrl: '/dashboard',
      };
      const res = {
        locals: {},
        redirect: sinon.stub(),
      };
      const next = sinon.stub();

      requireAuthRoute(req, res, next);

      expect(next.called).to.be.false;
      expect(res.redirect.calledOnce).to.be.true;
    });
  });
});
