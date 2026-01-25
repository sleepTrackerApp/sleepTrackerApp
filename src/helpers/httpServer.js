/**
 * Creates an HTTP server from the Express app and wires Socket.IO and scheduler.
 */
const http = require('http');
const { initialize } = require('./socket');
const { startScheduler } = require('./scheduler');

/**
 * Creates an HTTP server, attaches Socket.IO, and starts the scheduler.
 * The returned server is ready for server.listen(port).
 * @param {import('express').Express} app - Express application
 * @returns {import('http').Server} HTTP server instance
 */
function createHttpServer(app) {
  const server = http.createServer(app);
  const io = initialize(server, app);
  console.log('Socket initialized successfully');

  app.set('io', io);
  app.set('server', server);

  void startScheduler();

  return server;
}

module.exports = { createHttpServer };
