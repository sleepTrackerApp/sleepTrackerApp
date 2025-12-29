const { expect } = require('chai');

const { hashValue } = require('../../../src/helpers/encryption');

describe('Encryption function', () => {
  it('produces deterministic hashes for the same identifier', () => {
    const hashA = hashValue('auth0-user-123');
    const hashB = hashValue('auth0-user-123');
    const hashC = hashValue('auth0-user-456');

    expect(hashA).to.equal(hashB);
    expect(hashA).to.match(/^[a-f0-9]{64}$/);
    expect(hashA).to.not.equal(hashC);
  });

});

