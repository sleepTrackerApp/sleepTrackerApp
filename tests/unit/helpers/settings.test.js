const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('Settings helper', () => {
  const ORIGINAL_ENV = process.env;

  const loadConfig = () =>
      proxyquire('../../../src/helpers/settings', {
        dotenv: { config: () => ({}) },
      }).appConfig;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.PORT;
    delete process.env.MONGODB_URI;
    delete process.env.AUTH0_CLIENT_ID;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('loads config with expected shape and types', () => {
    const config = loadConfig();
    expect(config).to.be.an('object');
    expect(config).to.have.property('PORT').that.is.a('number');
    expect(config).to.have.property('MONGODB_URI').that.is.a('string');
    expect(config).to.have.property('AUTH0').that.is.an('object');
    expect(config.AUTH0).to.have.property('CLIENT_ID').that.is.a('string');
  });

  it('throws if PORT is not an integer', () => {
    process.env.PORT = 'abc';
    expect(() => loadConfig()).to.throw('Environment variable "PORT" must be an integer.');
  });
});
