/**
 * Service layer responsible for interacting with the User model.
 * Controllers should use these helpers instead of accessing models directly.
 */

const { User } = require('../models');
const { hashValue } = require('../helpers/encryption');

/**
 * Ensures a user document exists for the provided Auth0 identifier.
 * Updates the last login timestamp on each call.
 * @param {string} authId
 * @param {object} [options]
 * @param {Date} [options.loginAt]
 * @returns {Promise<import('mongoose').Document>}
 */
async function getOrCreateUser(authId, { loginAt = new Date() } = {}) {
  if (!authId) {
    throw new Error('authId is required');
  }

  const authIdHash = hashValue(authId);
  return User.findOneAndUpdate(
    { authIdHash },
    {
      $setOnInsert: { authIdHash },
      $set: { lastLoginAt: loginAt },
    },
    { new: true, upsert: true }
  ).exec();
}

/**
 * Retrieves a user by Auth0 identifier.
 * @param {string} authId - The Auth0 user ID (sub).
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUserByAuthId(authId) {
  if (!authId) {
    throw new Error('authId is required');
  }

  const authIdHash = hashValue(authId);
  return User.findOne({ authIdHash }).exec();
}

module.exports = {
  getOrCreateUser,
  findUserByAuthId,
};

