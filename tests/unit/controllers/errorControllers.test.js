const { expect } = require('chai');
const sinon = require('sinon');
const { render404, render500 } = require('../../../src/controllers/errorControllers');

describe('Page error controllers', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('renders 404 page on 404 error', () => {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      render: sinon.stub(),
    };

    render404(req, res);

    expect(res.status.calledOnceWithExactly(404)).to.be.true;
    expect(
      res.render.calledOnceWithExactly('pages/errors/404', {
        title: '404 - Page Not Found',
      })
    ).to.be.true;
  });

  it('renders 500 page on 500 error', () => {
    sinon.stub(console, 'error');
    const err = { message: 'Test error' }; // Plain object without name property
    const req = {};
    const res = {
      headersSent: false,
      status: sinon.stub(),
      render: sinon.stub(),
    };
    res.status.returns(res);
    const next = sinon.stub();

    render500(err, req, res, next);

    expect(res.status.calledOnceWithExactly(500)).to.be.true;
    expect(
      res.render.calledOnceWithExactly('pages/errors/500', {
        title: '500 - Internal Server Error',
      })
    ).to.be.true;
  });

  it('renders 500 on a custom error', () => {
    sinon.stub(console, 'error');
    const err = new Error('Not Implemented');
    err.status = 501;
    err.name = 'Not Implemented';
    const req = {};
    const res = {
      headersSent: false,
      status: sinon.stub(),
      render: sinon.stub(),
    };
    res.status.returns(res);
    const next = sinon.stub();

    render500(err, req, res, next);

    expect(res.status.calledOnceWithExactly(501)).to.be.true;
    expect(
      res.render.calledOnceWithExactly('pages/errors/500', {
        title: '501 - Not Implemented',
      })
    ).to.be.true;
  });
});
