const express = require('express');
const path = require('path');
const app = express();

// Port configuration
const PORT = process.env.PORT || 5000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// API routes (if you want to add any in the future)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Card Game server is running' });
});

// Catch all handler for React Router (SPA fallback)
// This serves index.html for any route that doesn't match static files or API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎮 E-Card Game server is running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to play the game`);
});

module.exports = app;