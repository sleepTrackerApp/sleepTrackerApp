/**
 * Creates a test server instance using Supertest and Express.
 * This module provides helper functions to build a test application instance
 * that can be used in integration tests.
 */

const request = require('supertest');
const { createApp } = require('../../src/app');

/**
 * Creates a fresh Express application instance for testing.
 * @returns {import('express').Express}
 */
function buildApp() {
  return createApp();
}

/**
 * Provides a Supertest request bound to a new app instance.
 * @returns {import('supertest').SuperTest<import('supertest').Test>}
 */
function buildRequest() {
  return request(buildApp());
}

module.exports = {
  buildRequest,
};
