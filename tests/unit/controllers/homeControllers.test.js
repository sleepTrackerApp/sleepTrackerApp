const { expect } = require('chai');
const sinon = require('sinon');
const { renderHome } = require('../../../src/controllers/homeControllers');

describe('Home controller tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('renders home page with correct title and activeMenu', () => {
    const req = {};
    const res = {
      render: sinon.stub(),
    };

    renderHome(req, res);

    expect(
      res.render.calledOnceWithExactly('pages/home', {
        title: 'Wake Up Truly Alive',
        activeMenu: 'home',
      })
    ).to.be.true;
  });
});

