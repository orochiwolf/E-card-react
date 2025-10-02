# E-Card Game Documentation

## 📚 Documentation Overview

This folder contains comprehensive documentation for deploying and maintaining the E-Card game.

## 🚀 Deployment Guides

### Quick Start
- **[cPanel Deployment Guide](deployment/CPANEL-DEPLOYMENT.md)** - Complete guide for o2switch cPanel hosting
- **[Update Deployment Guide](deployment/UPDATE-DEPLOYMENT.md)** - How to update your production deployment

### General Deployment
- **[General Deployment Guide](deployment/DEPLOYMENT.md)** - Node.js deployment options (Vercel, Heroku, etc.)

### Security
- **[Firebase Security Guide](deployment/FIREBASE-SECURITY.md)** - Essential Firebase/Firestore security setup

## 📁 Deployment Files

The `/deployment/` folder in the project root contains:

- `server-cpanel.js` - cPanel-optimized Express server
- `server.js` - General Express server  
- `package-production.json` - Production package.json template

## 🔧 Project Structure

```
ecard-game/
├── src/                    # React app source code
├── public/                 # Static assets
├── docs/                   # Documentation (this folder)
│   └── deployment/         # Deployment guides
├── deployment/             # Deployment configuration files
├── .env.production         # Production environment variables
└── docker-compose.yml      # Development setup
```

## 🎯 Quick Deployment Steps

1. **Build the app**: `docker-compose run --rm web npm run build`
2. **Create deployment package**: Copy files from `/deployment/` + `build/` + `.env.production`
3. **Upload to hosting**: Follow the relevant deployment guide above
4. **Configure Firebase security**: Set up Firestore rules (see Firebase Security guide)

## 🔒 Security Notes

- **Firestore Rules**: Always configure before going live
- **Environment Variables**: Use `.env.production` for production config  
- **HTTPS**: Ensure your hosting uses HTTPS (required for Firebase)

## 📞 Support

Check the individual deployment guides for troubleshooting steps and hosting-specific instructions.