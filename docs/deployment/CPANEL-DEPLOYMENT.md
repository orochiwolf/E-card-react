# E-Card Game - o2switch cPanel Deployment Guide

This guide walks you through deploying your E-Card game to o2switch hosting using cPanel's Node.js app feature.

## 📦 What You Have Ready

- `ecard-game-cpanel.zip` - Complete deployment package (832KB)
- Production-optimized React build
- cPanel-configured Express server
- All necessary dependencies

## 🚀 cPanel Deployment Steps

### Step 1: Access Your cPanel

1. Log into your o2switch hosting account
2. Open cPanel from your hosting dashboard
3. Look for **"Node.js Apps"** or **"Setup Node.js App"** in the Software section

### Step 2: Create New Node.js Application

1. **Click "Create Application"**
2. **Configure the application:**
   - **Node.js version**: Select latest available (16+ recommended)
   - **Application mode**: `Production`
   - **Application root**: `/public_html/ecard-game` (or your preferred directory)
   - **Application URL**: `your-domain.com/ecard-game` or subdomain
   - **Application startup file**: `server-cpanel.js`

3. **Click "Create"**

### Step 3: Upload Your Files

1. **Go to File Manager** in cPanel
2. **Navigate to** your application root directory (e.g., `/public_html/ecard-game/`)
3. **Upload the zip file:**
   - Click "Upload"
   - Select `ecard-game-cpanel.zip`
   - Upload and extract it
4. **Verify files structure:**
   ```
   /public_html/ecard-game/
   ├── server-cpanel.js
   ├── package.json
   └── build/
       ├── index.html
       ├── asset-manifest.json
       └── static/
           └── js/
               └── main.7886d186.js
   ```

### Step 4: Install Dependencies

1. **Go back to Node.js Apps** in cPanel
2. **Click on your application**
3. **Click "Run NPM Install"** button
   - This will install Express.js from your package.json
   - Wait for completion (should show "Completed successfully")

### Step 5: Start Your Application

1. **In the Node.js Apps interface:**
   - Click "Start App" or "Restart App"
   - Wait for status to show "Running"

2. **Check the application:**
   - Status should be green/running
   - Note the assigned port (if shown)

### Step 6: Test Your Deployment

1. **Visit your game URL:**
   - `https://your-domain.com/ecard-game`
   - Or the URL shown in cPanel

2. **Test key features:**
   - ✅ Page loads correctly
   - ✅ Can create a new game
   - ✅ Firebase connection works
   - ✅ Multiplayer functionality
   - ✅ Error boundary works

3. **Check health endpoint:**
   - `https://your-domain.com/ecard-game/api/health`
   - Should return JSON status

## 🔧 Troubleshooting

### Application Won't Start

**Check these common issues:**

1. **File permissions:**
   ```bash
   # In cPanel File Manager, set permissions:
   # server-cpanel.js: 644
   # package.json: 644
   # build/ folder: 755
   ```

2. **Node.js version:**
   - Ensure Node.js 16+ is selected
   - Try changing to different version if available

3. **Package.json issues:**
   - Verify package.json is valid JSON
   - Check that "main" points to "server-cpanel.js"

### Application Starts But Won't Load

1. **Check application URL in cPanel**
   - Note the exact URL provided
   - Some hosts use subdirectories or ports

2. **Verify build files:**
   - Ensure `build/index.html` exists
   - Check that static files are in `build/static/`

3. **Check application logs:**
   - In Node.js Apps, look for log viewer
   - Check for error messages

### Firebase Connection Issues

1. **Domain authorization:**
   - Add your production domain to Firebase project
   - Go to Firebase Console > Authentication > Settings > Authorized domains

2. **HTTPS requirement:**
   - Ensure your site uses HTTPS
   - Firebase requires secure connections in production

### Performance Issues

1. **Enable caching in cPanel:**
   - Look for caching options in cPanel
   - Enable gzip compression if available

2. **CDN setup:**
   - Consider using Cloudflare with o2switch
   - Can improve global loading times

## 📊 Application Details

**Your production setup:**
- **Framework**: Express.js serving React SPA
- **Database**: Firebase Firestore (real-time)
- **Build size**: ~125KB gzipped JavaScript
- **Memory usage**: ~50MB typical
- **Startup time**: ~2-3 seconds

## 🔄 Updates and Maintenance

### To Update Your Game:

1. **Build new version locally:**
   ```bash
   docker-compose run --rm web npm run build
   ```

2. **Create new deployment package:**
   ```bash
   # Copy files to cpanel-deploy directory
   cp server-cpanel.js cpanel-deploy/
   cp package-production.json cpanel-deploy/package.json
   cp -r build cpanel-deploy/
   
   # Create new zip
   cd cpanel-deploy && zip -r ../ecard-game-cpanel-v2.zip .
   ```

3. **Deploy update:**
   - Stop the app in cPanel
   - Upload and extract new zip
   - Run NPM install if package.json changed
   - Start the app

### Monitoring Your Application:

- **Check app status** in cPanel Node.js Apps regularly
- **Monitor logs** for errors or issues
- **Test multiplayer functionality** periodically
- **Verify Firebase connection** stays active

## 🌐 Production URLs

After successful deployment, your game will be available at:
- **Main game**: `https://your-domain.com/ecard-game`
- **Health check**: `https://your-domain.com/ecard-game/api/health`

## 📱 Mobile Compatibility

Your game is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile phones
- ✅ Tablets
- ✅ Touch interfaces

## 🚨 Important Security Notes

1. **Firebase configuration** is included in the client-side code
2. **Set up Firestore security rules** in Firebase Console
3. **Consider environment variables** for sensitive config in production
4. **Enable HTTPS** (usually automatic on o2switch)

## 📞 Support

If you encounter issues:

1. **Check cPanel error logs**
2. **Verify Node.js version compatibility**
3. **Contact o2switch support** for hosting-specific issues
4. **Check Firebase Console** for database issues

Your E-Card game is now ready for production on o2switch! 🎮🚀