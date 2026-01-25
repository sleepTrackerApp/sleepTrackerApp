/**
 * Alive Sleep Tracker Application
 * Entry point for the server.
 */
const createApp = require('./app');
const { connectDb } = require('./helpers/db');
const { appConfig } = require('./helpers/settings');
const { createHttpServer } = require('./helpers/httpServer');

const { PORT, MONGODB_URI } = appConfig;

/**
 * Connects to the database and starts the Express server.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    await connectDb(MONGODB_URI);
    const app = createApp();
    const server = createHttpServer(app);

    server.listen(PORT, () => {
      console.log(`Alive Sleep Tracker App server listening on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set a free PORT in your .env or stop the other process.`);
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
void startServer();
