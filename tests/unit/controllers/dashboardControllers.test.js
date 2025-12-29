const { expect } = require('chai');
const sinon = require('sinon');
const { renderDashboard } = require('../../../src/controllers/dashboardControllers');

describe('Dashboard controller tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('redirects to /auth/login when user is not authenticated', () => {
    const req = { oidc: { isAuthenticated: () => false } };
    const res = {
      redirect: sinon.stub(),
    };

    renderDashboard(req, res);

    expect(res.redirect.calledOnceWithExactly('/auth/login')).to.be.true;
  });

  it('renders dashboard when user is authenticated', () => {
    const req = {
      oidc: {
        isAuthenticated: () => true,
        user: { sub: 'auth0|user', name: 'Tester', email: 'tester@example.com' },
      },
    };
    const res = {
      locals: { displayName: 'Display Tester' },
      render: sinon.stub(),
    };

    renderDashboard(req, res);

    expect(
      res.render.calledOnceWithExactly('pages/dashboard', {
        title: 'My Sleep Data',
        activeMenu: 'dashboard',
        displayName: 'Display Tester',
        isAuthenticated: true,
      })
    ).to.be.true;
  });
});

