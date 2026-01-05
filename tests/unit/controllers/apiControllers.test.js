const { expect } = require('chai');
const sinon = require('sinon');
const { apiWelcome, apiNotFound, apiError } = require('../../../src/controllers/apiControllers');

describe('API controllers', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('API Welcome', () => {
    it('returns welcome message as JSON', () => {
      const req = {};
      const res = {
        json: sinon.stub(),
      };

      apiWelcome(req, res);

      expect(
        res.json.calledOnceWithExactly({
          message: 'Welcome to the Alive Sleep Tracker API',
        })
      ).to.be.true;
    });
  });

  describe('API Not Found', () => {
    it('returns 404 error with path', () => {
      const req = {
        originalUrl: '/api/does-not-exist',
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      apiNotFound(req, res);

      expect(res.status.calledOnceWithExactly(404)).to.be.true;
      expect(
        res.json.calledOnceWithExactly({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'The requested API endpoint does not exist',
            path: '/api/does-not-exist',
          },
        })
      ).to.be.true;
    });
  });

  describe('API Error', () => {
    it('handles error with default 500 status', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const err = new Error('Test error');
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      apiError(err, req, res, next);

      expect(consoleErrorStub.calledOnceWithExactly('Unhandled API error:', err)).to.be.true;
      expect(res.status.calledOnceWithExactly(500)).to.be.true;
      expect(
        res.json.calledOnceWithExactly({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred while processing the request',
          },
        })
      ).to.be.true;
    });

    it('handles error with custom status code', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const err = new Error('Not found');
      err.status = 404;
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      apiError(err, req, res, next);

      expect(consoleErrorStub.calledOnceWithExactly('Unhandled API error:', err)).to.be.true;
      expect(res.status.calledOnceWithExactly(404)).to.be.true;
      expect(
        res.json.calledOnceWithExactly({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred while processing the request',
          },
        })
      ).to.be.true;
    });
  });
});

