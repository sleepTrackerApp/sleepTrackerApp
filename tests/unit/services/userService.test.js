const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('User service', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('hashes authId and upserts user', async () => {
    const hashValueStub = sandbox.stub().returns('hash123');
    const mockUser = { authIdHash: 'hash123', _id: 'user123' };
    const UserStub = {
      findOneAndUpdate: sandbox.stub().resolves(mockUser),
    };

    const userService = proxyquire('../../../src/services/userService', {
      '../models': { User: UserStub },
      '../helpers/encryption': { hashValue: hashValueStub },
    });

    const result = await userService.getOrCreateUser('auth0|user');

    expect(hashValueStub.calledOnceWithExactly('auth0|user')).to.be.true;
    expect(UserStub.findOneAndUpdate.calledOnce).to.be.true;
    expect(UserStub.findOneAndUpdate.calledWith(
      { authIdHash: 'hash123' },
      {
        $setOnInsert: { authIdHash: 'hash123' },
        $set: { lastLoginAt: sinon.match.date },
      },
      { new: true, upsert: true }
    )).to.be.true;
    expect(result).to.deep.equal(mockUser);
  });
});