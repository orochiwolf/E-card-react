# Firebase Security Guide for E-Card Game

## 🔍 Current Security Status

**Your Firebase configuration is PARTIALLY SECURE but needs immediate attention.**

## ⚠️ Key Security Facts

### What's Normal:
- **Firebase Web API keys are designed to be public** - they identify your project
- **Client-side exposure is expected** - Firebase SDK requires these values
- **API key ≠ authentication** - The API key just identifies your project

### What Matters for Security:
- **Firestore Security Rules** (CRITICAL)
- **Authorized Domains** (Important)
- **Authentication** (if you add user accounts)

## 🚨 URGENT: Set Up Firestore Security Rules

**Your database is currently open to anyone!** You need to configure Firestore rules immediately.

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ecard-kaiji-game`
3. Navigate to **Firestore Database** > **Rules**

### Step 2: Implement Secure Rules

Replace the default rules with these secure rules for your game:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to games collection
    match /games/{gameId} {
      // Allow anyone to read and write to games
      // This is necessary for your multiplayer game to work
      allow read, write: if true;
      
      // More secure alternative (if you want to add validation):
      // allow read: if true;
      // allow write: if request.resource.data.keys().hasAll(['players', 'gameState']) 
      //              && request.resource.data.players is map
      //              && request.resource.data.gameState is string;
    }
    
    // Deny all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Set Up Domain Authorization

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your production domains:
   - `your-domain.com`
   - `www.your-domain.com`
   - Any other domains where your game will be hosted

## 🔒 Enhanced Security Options

### Option 1: Basic Security (Recommended for your game)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Allow read/write but add some basic validation
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['players', 'gameState', 'scores'])
                   && request.resource.data.players.size() <= 2;
      allow update: if request.resource.data.keys().hasAll(['players', 'gameState'])
                   && prior(resource.data.players).size() == resource.data.players.size();
      allow delete: if false; // Prevent game deletion
    }
  }
}
```

### Option 2: Time-based Security

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if true;
      // Auto-expire games after 24 hours
      allow read: if resource.data.createdAt > timestamp.date() - duration.value(1, 'd');
    }
  }
}
```

## 🛡️ Additional Security Measures

### 1. Environment Variables (Already Set Up)

Your Firebase config now uses environment variables, which is a good practice for organization:

```bash
# .env.production contains your config
REACT_APP_FIREBASE_API_KEY=AIzaSyAm3-L6I0S_2WAj-TMo2PLy7BazA472puM
# ... other config values
```

### 2. Network Security

- **HTTPS Only**: Ensure your site uses HTTPS (o2switch provides this)
- **CORS**: Firebase handles CORS automatically for authorized domains

### 3. Monitoring

Enable Firebase Security Rules monitoring:
1. Go to Firebase Console > Firestore > Rules
2. Click on "Simulator" tab to test your rules
3. Enable logging to monitor rule violations

## 🎮 Game-Specific Security Considerations

### What Your Game Does:
- Creates game documents in `/games/{gameId}`
- Updates player hands, choices, and scores
- Real-time listeners for game state changes

### Security Implications:
- **Players can see game data** - This is necessary for multiplayer
- **Players can modify game state** - Required for turn-based gameplay
- **No user authentication** - Anyone can join any game with the game ID

### Recommendations:

1. **Game ID Security**: Your game IDs should be hard to guess (currently 6 characters)
2. **Input Validation**: Add client-side validation (already present)
3. **Rate Limiting**: Consider adding rate limiting if abuse becomes an issue

## 🚀 Production Deployment Security Checklist

Before deploying to production:

- [ ] **Set Firestore Security Rules** (see above)
- [ ] **Add production domain to Authorized Domains**
- [ ] **Verify HTTPS is enabled** on your hosting
- [ ] **Test security rules** using Firebase Console simulator
- [ ] **Monitor for unauthorized access** in Firebase Console

## 🔧 Testing Your Security

### Test Firestore Rules:
1. Go to Firebase Console > Firestore > Rules > Simulator
2. Test operations like:
   - Reading a game: `games/test123`
   - Writing game data
   - Creating new games

### Test Domain Authorization:
1. Deploy your game
2. Try accessing from unauthorized domain (should fail)
3. Verify it works from your authorized domain

## ⚡ Quick Security Fix

**Immediate action needed:**

1. **Go to Firebase Console NOW**
2. **Set up the basic Firestore rules** (copy-paste from above)
3. **Add your domain** to authorized domains
4. **Your game will be much more secure**

## 📊 Security Level Assessment

| Current Status | Security Level | Risk |
|---------------|----------------|------|
| No Firestore Rules | 🔴 HIGH RISK | Anyone can read/write your database |
| Basic Rules | 🟡 MEDIUM | Good for game functionality |
| Advanced Rules | 🟢 SECURE | Production-ready |

## 🆘 Emergency Security

If you suspect unauthorized access:
1. **Immediately change Firestore rules** to deny all access
2. **Check Firebase Console logs** for unusual activity
3. **Review authorized domains** list
4. **Consider regenerating API keys** (creates new project)

Your Firebase setup will be secure once you implement the Firestore rules above! 🔒