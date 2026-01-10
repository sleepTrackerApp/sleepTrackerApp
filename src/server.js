/**
 * Alive Sleep Tracker Application
 * Entry point for the server.
 */
const createApp = require('./app');
const { connectDb } = require('./helpers/db');
const { appConfig } = require('./helpers/settings');

const { PORT, MONGODB_URI } = appConfig;

/**
 * Connects to the database and starts the Express server.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDb(MONGODB_URI);
    // Create and start the Express app
    const app = createApp();

    // Start listening on the specified port
    app.listen(PORT, () => {
      console.log(`Alive Sleep Tracker App server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Handle errors during startup
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


// Start the server
void startServer();

