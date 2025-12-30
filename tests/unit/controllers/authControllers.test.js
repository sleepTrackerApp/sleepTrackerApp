const { expect } = require('chai');
const sinon = require('sinon');
const { login, logout } = require('../../../src/controllers/authControllers');

describe('Auth controllers', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('login', () => {
    it('redirects to default dashboard when no returnTo is provided', () => {
      const loginStub = sinon.stub();
      const req = { query: {} };
      const res = { oidc: { login: loginStub } };

      login(req, res);

      expect(loginStub.calledOnceWithExactly({ returnTo: '/dashboard' })).to.be.true;
    });

    it('redirects to whitelisted returnTo path', () => {
      const loginStub = sinon.stub();
      const req = { query: { returnTo: '/dashboard' } };
      const res = { oidc: { login: loginStub } };

      login(req, res);

      expect(loginStub.calledOnceWithExactly({ returnTo: '/dashboard' })).to.be.true;
    });

    it('redirects to home when returnTo is /', () => {
      const loginStub = sinon.stub();
      const req = { query: { returnTo: '/' } };
      const res = { oidc: { login: loginStub } };

      login(req, res);

      expect(loginStub.calledOnceWithExactly({ returnTo: '/' })).to.be.true;
    });

    it('rejects external URLs and uses default', () => {
      const loginStub = sinon.stub();
      const req = { query: { returnTo: 'https://evil.com' } };
      const res = { oidc: { login: loginStub } };

      login(req, res);

      expect(loginStub.calledOnceWithExactly({ returnTo: '/dashboard' })).to.be.true;
    });

  });

  describe('logout', () => {
    it('redirects to root on logout', () => {
      const logoutStub = sinon.stub();
      const req = {};
      const res = { oidc: { logout: logoutStub } };

      logout(req, res);

      expect(logoutStub.calledOnceWithExactly({ returnTo: '/' })).to.be.true;
    });
  });
});

