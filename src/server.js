/**
 * Alive Sleep Tracker Application
 * Entry point for the server.
 */
const { createApp } = require('./app');

const app = createApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Alive Sleep Tracker App server listening on http://localhost:${PORT}`);
});

