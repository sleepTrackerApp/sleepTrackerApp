/**
 * Helper functions to manage application settings from environment variables.
 */

require('dotenv').config();

/**
 * Retrieves an environment variable from process.env, with optional default.
 * @param name - Name of the environment variable
 * @param defaultValue - Default value if the variable is not set
 * @returns {string} The environment variable value
 */
function getEnv(name, defaultValue) {
    const value = process.env[name] || defaultValue;
    if (!value) throw new Error(`Environment variable "${name}" is required.`);
    return value;
}

/**
 * Ensures an environment variable is parsed as an integer.
 * Uses getEnv to retrieve the value and parseInt to convert it.
 * @param name - Name of the environment variable
 * @param defaultValue - Default value if the variable is not set
 * @returns {number} The integer value of the environment variable
 */
function getEnvInt(name, defaultValue) {
    const v = parseInt(getEnv(name, defaultValue));
    if (Number.isNaN(v)) throw new Error(`Environment variable "${name}" must be an integer.`);
    return v;
}

/**
 * Ensures an environment variable is parsed as a boolean.
 * Accepts 'true', 'false', '1', '0' (case insensitive).
 * @param name - Name of the environment variable
 * @param defaultValue - Default value if the variable is not set
 * @returns {boolean} The boolean value of the environment variable
 */
function getEnvBool(name, defaultValue) {
    const v = getEnv(name, defaultValue).toLowerCase();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
    throw new Error(`Environment variable "${name}" must be a boolean value.`);
}

/** Application configuration object.
 * Builds up the configuration from environment variables with defaults,
 * and can be used in other modules of the application.
 * @type {Readonly<{
 *   PORT: number,
 *   MONGODB_URI: string,
 *   BASE_URL: string,
 *   NODE_ENV: string,
 *   ENCRYPTION_KEY: string,
 *   AUTH0: Readonly<{
 *     ISSUER_BASE_URL: string,
 *     CLIENT_ID: string,
 *     CLIENT_SECRET: string,
 *     SECRET: string,
 *   }>
 * }>}
 */
const appConfig = Object.freeze({
    // Defines the port the application will listen on
    PORT: getEnvInt('PORT', 3000),
    // Defines the MongoDB connection URI
    MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://localhost:27017/alive-sleep-tracker'),
    // Base host used for constructing absolute links
    BASE_URL: getEnv('BASE_URL', 'http://localhost'),
    // Current application environment (development, test, production)
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    // Symmetric encryption key used for hashing/encrypting sensitive data
    ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY', 'development-only-secret-key'),
    // Auth0 configuration
    AUTH0: Object.freeze({
        ISSUER_BASE_URL: getEnv('AUTH0_ISSUER_BASE_URL', 'https://dev-example.us.auth0.com'),
        CLIENT_ID: getEnv('AUTH0_CLIENT_ID', 'replace-with-auth0-client-id'),
        CLIENT_SECRET: getEnv('AUTH0_CLIENT_SECRET', 'replace-with-auth0-client-secret'),
        SECRET: getEnv('AUTH0_SECRET', 'replace-with-auth0-session-secret'),
    }),
});

module.exports = { appConfig };