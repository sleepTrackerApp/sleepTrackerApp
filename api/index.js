const createApp = require("../src/app");
const { connectDb } = require("../src/helpers/db");
const { appConfig } = require("../src/helpers/settings");

const app = createApp();

// Default export for Vercel serverless function
module.exports = async (req, res) => {
    await connectDb(appConfig.MONGODB_URI);
    return app(req, res);
};
