const createApp = require('../../src/app');
const { connectDb, disconnectDb } = require('../../src/helpers/db');
const { appConfig } = require('../../src/helpers/settings');
const { createHttpServer } = require('../../src/helpers/httpServer');
const {
  createMockAuthMiddleware,
  createMockUserSyncMiddleware,
} = require('../helpers/testAuth');

// HTTP server instance
let server;
// Port for the E2E server (read from env or default to 4173)
// don't use appConfig to keep tests separated from dev/prod settings
const port = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 4173;

/**
 * Function to start the HTTP server for E2E tests.
 * @returns {Promise<{port: number|number}>} - Resolves with the port the server is listening on.
 */
async function startServer() {
  await connectDb(appConfig.MONGODB_URI);

  const app = createApp({
    authMiddlewareOption: createMockAuthMiddleware(),
    userSyncMiddlewareOption: createMockUserSyncMiddleware(),
  });

  server = createHttpServer(app);

  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[E2E] Server listening on http://localhost:${port}`);
      resolve();
    });
  });

  return { port };
}

/**
 * Function to stop the HTTP server and disconnect from the database.
 * @returns {Promise<void>} - Resolves when the server is stopped and DB is disconnected.
 */
async function stopServer() {
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('[E2E] Server stopped');
        resolve();
      });
    });
    server = null;
  }

  await disconnectDb();
}

module.exports = { startServer, stopServer };
