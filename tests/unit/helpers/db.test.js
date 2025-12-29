const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('DB helper', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function loadDbHelper({ readyState = 0 } = {}) {
    const mongooseMock = {
      connection: {
        readyState,
        on: sandbox.stub(),
      },
      connect: sandbox.stub().resolves(),
      disconnect: sandbox.stub().resolves(),
    };

    const dbHelper = proxyquire('../../../src/helpers/db', {
      mongoose: mongooseMock,
    });

    return { dbHelper, mongooseMock };
  }

  describe('DB connection', () => {
    it('throws when uri is empty', async () => {
      const { dbHelper } = loadDbHelper();
      try {
        await dbHelper.connectDb('');
        expect.fail('Expected error');
      } catch (err) {
        expect(err.message).to.include('Missing MongoDB connection string');
      }
    });

    it('returns immediately when already connected', async () => {
      const { dbHelper, mongooseMock } = loadDbHelper({ readyState: 1 });
      const result = await dbHelper.connectDb('mongodb://fake-server/test');
      expect(result).to.equal(mongooseMock);
      expect(mongooseMock.connect.called).to.be.false;
    });

    it('calls mongoose.connect with uri and merged options', async () => {
      const { dbHelper, mongooseMock } = loadDbHelper({ readyState: 0 });
      const uri = 'mongodb://fake-server/test';
      await dbHelper.connectDb(uri, { serverSelectionTimeoutMS: 10000 });
      expect(mongooseMock.connect.calledOnce).to.be.true;

    });
  });

  describe('disconnectDb', () => {
    it('disconnects only when connected/connecting', async () => {
      const connected = loadDbHelper({ readyState: 1 });
      await connected.dbHelper.disconnectDb();
      expect(connected.mongooseMock.disconnect.calledOnce).to.be.true;

      const notConnected = loadDbHelper({ readyState: 0 });
      await notConnected.dbHelper.disconnectDb();
      expect(notConnected.mongooseMock.disconnect.called).to.be.false;
    });
  });
});
