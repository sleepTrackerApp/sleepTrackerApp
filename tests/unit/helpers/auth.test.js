const { expect } = require('chai');
const sinon = require('sinon');
const { buildAuthConfig, userSyncMiddleware } = require('../../../src/helpers/auth');
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

  it('buildAuthConfig creates config with custom routes disabled', () => {
    const config = buildAuthConfig();
    expect(config.authRequired).to.be.false;
    expect(config.auth0Logout).to.be.true;
    expect(config.routes).to.deep.equal({
      login: false,
      logout: false,
      callback: '/auth/callback',
    });
  });

  it('sync middleware skips when unauthenticated', async () => {
    const req = { oidc: { isAuthenticated: () => false } };
    const res = { locals: {} };
    const next = sinon.stub();
    await userSyncMiddleware(req, res, next);
    expect(res.locals.isAuthenticated).to.be.false;
    expect(userService.getOrCreateUser.called).to.be.false;
    expect(next.calledOnce).to.be.true;
  });

  it('sync middleware creates user on first login', async () => {
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
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };
    userService.getOrCreateUser.resolves(newUserRecord);
    await userSyncMiddleware(req, res, next);
    expect(userService.getOrCreateUser.calledOnceWithExactly('auth0|new-user')).to.be.true;
    expect(res.locals.userRecord).to.deep.equal(newUserRecord);
    expect(res.locals.isFirstLogin).to.be.true;
    expect(next.calledOnce).to.be.true;
  });

  it('sync middleware populates locals and reuses existing user', async () => {
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
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
    };
    userService.getOrCreateUser.resolves(existingRecord);
    await userSyncMiddleware(req, res, next);
    expect(res.locals.isAuthenticated).to.be.true;
    expect(res.locals.userRecord).to.deep.equal(existingRecord);
    expect(res.locals.isFirstLogin).to.be.false;
    expect(userService.getOrCreateUser.calledOnceWithExactly('auth0|existing')).to.be.true;
    expect(next.calledOnce).to.be.true;
  });
});

