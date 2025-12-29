const { expect } = require('chai');
const sinon = require('sinon');
const { buildAuthConfig, userSyncMiddleware } = require('../../../src/helpers/auth');
const userService = require('../../../src/services/userService');

describe('Auth0 auth helpers', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(userService, 'getOrCreateUser').resolves({ authIdHash: 'hash' });
    sandbox.stub(userService, 'findUserByAuthId').resolves(null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates middleware config without requiring afterCallback', () => {
    const config = buildAuthConfig();
    expect(config.authRequired).to.be.false;
    expect(config.auth0Logout).to.be.true;
    expect(config.routes).to.deep.equal({ login: '/auth/login', callback: '/auth/callback' });
    expect(config).to.not.have.property('afterCallback');
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

    userService.findUserByAuthId.resolves({ authIdHash: 'hash' });

    await userSyncMiddleware(req, res, next);

    expect(res.locals.isAuthenticated).to.be.true;
    expect(res.locals.userRecord).to.deep.equal({ authIdHash: 'hash' });
    expect(res.locals.isFirstLogin).to.be.false;
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

    await userSyncMiddleware(req, res, next);

    expect(userService.findUserByAuthId.calledOnceWithExactly('auth0|new-user')).to.be.true;
    expect(userService.getOrCreateUser.calledOnceWithExactly('auth0|new-user')).to.be.true;
    expect(res.locals.isFirstLogin).to.be.true;
    expect(next.calledOnce).to.be.true;
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
});
