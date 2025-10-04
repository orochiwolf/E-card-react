const express = require('express');
const path = require('path');
const app = express();

// cPanel often uses different port configurations
// Check for cPanel environment variables or use default
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
const IP = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// Enable trust proxy for cPanel reverse proxy setup
app.set('trust proxy', true);

// Security headers for production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1h', // Cache static assets for 1 hour (much more reasonable)
  etag: true    // Enable etag for better cache invalidation
}));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'E-Card Game server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Catch all handler for React Router (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

app.listen(PORT, IP, () => {
  console.log(`🎮 E-Card Game server is running on ${IP}:${PORT}`);
  console.log(`📱 Game is ready to play!`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);
});

module.exports = app;