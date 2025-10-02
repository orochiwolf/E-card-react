# E-Card Game - Node.js Server Deployment Guide

This guide explains how to build and deploy your E-Card game as a Node.js server hosting the React frontend.

## Architecture Overview

- **Frontend**: React app built into static files (`build/` directory)
- **Backend**: Express.js server serving the static files
- **Database**: Firebase Firestore (unchanged)
- **Port**: Default 5000 (configurable via `PORT` environment variable)

## Development Setup

### Using Docker (Recommended for Development)

1. **Build the React app:**
   ```bash
   docker-compose run --rm web npm run build
   ```

2. **Start the production server:**
   ```bash
   docker-compose run --rm -p 5000:5000 web node server.js
   ```

3. **Access the game:**
   - Open `http://localhost:5000` in your browser
   - The app will work exactly like in development mode
   - Firebase real-time multiplayer will function normally

### Using Node.js Directly

If you have Node.js installed locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the React app:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm run serve
   # or
   node server.js
   ```

## Production Deployment

### Option 1: Cloud Platforms (Heroku, Railway, Render, etc.)

1. **Prepare your repository:**
   ```bash
   git add .
   git commit -m "Add production server setup"
   git push origin main
   ```

2. **Deploy on platform of choice:**
   - **Heroku**: Connect your GitHub repo, enable auto-deploy
   - **Railway**: Connect GitHub, it will auto-detect Node.js
   - **Render**: Create new web service from GitHub repo

3. **Platform will automatically:**
   - Install dependencies (`npm install`)
   - Build the React app (`npm run build`) 
   - Start the server (`npm run serve` or `node server.js`)

### Option 2: VPS/Server Deployment

1. **On your server:**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd react-version
   
   # Install Node.js dependencies
   npm install
   
   # Build the React app
   npm run build
   
   # Start the server
   npm run serve
   ```

2. **Process Management (recommended):**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start with PM2
   pm2 start server.js --name "e-card-game"
   
   # Save PM2 process list and enable startup
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Docker Production

1. **Create production Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Copy app files
   COPY . .
   RUN npm run build
   
   # Expose port
   EXPOSE 5000
   
   # Start server
   CMD ["node", "server.js"]
   ```

2. **Build and run:**
   ```bash
   docker build -t e-card-game .
   docker run -p 5000:5000 e-card-game
   ```

## Environment Variables

Configure these environment variables in production:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to `production`

## Firebase Configuration

Your Firebase configuration is currently in `src/firebase.js`. For production:

1. **Secure API keys**: Move to environment variables if needed
2. **Firestore Rules**: Ensure proper security rules are configured
3. **Domain authorization**: Add your production domain to Firebase project

## Server Features

The Express server (`server.js`) provides:

- **Static file serving**: Serves built React app from `/build` directory
- **SPA routing**: Fallback to `index.html` for client-side routing
- **Health check**: `GET /api/health` endpoint
- **Production ready**: Configurable port, proper error handling

## Testing Production Build

Before deployment, test locally:

1. Build and start server
2. Test game creation and joining
3. Test multiplayer functionality
4. Verify error boundary works
5. Check Firebase connection

## Performance Considerations

- Static files are served with appropriate caching headers
- React build is optimized and minified (125KB gzipped)
- Firebase connections remain efficient
- Server has minimal overhead

## Troubleshooting

**Build fails:**
- Ensure all dependencies are installed
- Check for TypeScript/compilation errors

**Server won't start:**
- Verify Express is installed
- Check that build/ directory exists
- Ensure port 5000 (or configured port) is available

**Game doesn't work:**
- Verify Firebase configuration
- Check browser console for errors
- Ensure Firebase project allows your domain

**Docker issues:**
- Verify volume mappings in docker-compose.yml
- Rebuild container if needed: `docker-compose build`

## Quick Start Commands

```bash
# Full build and serve (Docker)
docker-compose run --rm web npm run build
docker-compose run --rm -p 5000:5000 web node server.js

# Full build and serve (Local)
npm install && npm run build && npm run serve

# Check if working
curl http://localhost:5000/api/health
```

## Next Steps

- Set up CI/CD pipeline for automatic deployments
- Add monitoring and logging
- Configure SSL/HTTPS for production
- Implement rate limiting if needed
- Add performance monitoring