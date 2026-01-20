const { expect } = require('chai');
const sinon = require('sinon');
const { renderDashboard } = require('../../../src/controllers/dashboardControllers');

describe('Dashboard controller tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('renders dashboard when user is authenticated', () => {
    const req = {};
    const res = {
      locals: {
        isAuthenticated: true,
        displayName: 'Display Tester',
      },
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    renderDashboard(req, res);

    expect(
      res.render.calledOnceWithExactly('pages/dashboard', {
        title: 'My Sleep Data',
        activeMenu: 'log',
        isDashboard: true,
      })
    ).to.be.true;
  });
});

