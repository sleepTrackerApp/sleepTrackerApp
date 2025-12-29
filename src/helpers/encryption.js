/**
/**
 * Hashing utilities for securing Auth0 identifiers without storing raw values.
 */

const crypto = require('crypto');
const { appConfig } = require('./settings');

/**
 * Produces a deterministic HMAC-based hash for the provided value.
 * @param {string} value
 * @returns {string}
 */
function hashValue(value) {
  if (!value) {
    throw new Error('Value must be provided for hashing.');
  }

  const keySource = appConfig.ENCRYPTION_KEY;
  if (!keySource) {
    throw new Error('Missing ENCRYPTION_KEY configuration.');
  }

  return crypto.createHmac('sha256', keySource).update(value).digest('hex');
}

module.exports = {
  hashValue,
};

