/**
 * Helper functions to manage MongoDB connection using Mongoose.
 * Ensures a single connection instance is reused across the application.
 **/

const mongoose = require('mongoose');

let connectionPromise = null; // Holds the promise of the current connection attempt
let listenersBound = false; // Ensures event listeners are bound only once

/**
 * Binds event listeners to the Mongoose connection to log connection status.
 * This function is idempotent and will only bind listeners once.
 * @return {void}
 */
function bindConnectionListeners() {
  // Prevent multiple bindings
  if (listenersBound) return;
  listenersBound = true;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
    // NOTE: don't set connectionPromise = null here in general
    // (more on that below)
  });
}

/**
 * Establishes a MongoDB connection using Mongoose.
 * Reuses the existing connection if already connected.
 * @param uri MongoDB connection string.
 * @param options Optional Mongoose connection options.
 * @returns {Promise<mongoose>} The Mongoose instance with an active connection.
 */
async function connectDb(uri, options = {}) {
  if (!uri) {
    throw new Error('Missing MongoDB connection string. Set the MONGODB_URI environment variable.');
  }

  // Bind connection event listeners
  bindConnectionListeners();

  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If no connection attempt is in progress, start one
  if (!connectionPromise) {
    connectionPromise = mongoose
        .connect(uri, {
          serverSelectionTimeoutMS: 5000,
          ...options,
        })
        .catch((err) => {
          // Important: allow retry if the initial connect fails
          connectionPromise = null;
          throw err;
        });
  }

  // Return the promise of the connection attempt
  return connectionPromise;
}

/**
 * Disconnects from the MongoDB database if connected.
 * @returns {Promise<void>}
 */
async function disconnectDb() {
  // Only disconnect if there is an active connection or a connection attempt in progress
  if (connectionPromise || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
}

module.exports = { connectDb, disconnectDb, mongoose };
