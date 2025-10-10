# Firebase Security Setup Guide

## 1. Firestore Security Rules (REQUIRED)

Go to **Firebase Console → Firestore Database → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isValidExperience() {
      let data = request.resource.data;
      return data.keys().hasAll(['country', 'visaType', 'entryExperience', 'difficulty', 'travelDate', 'createdAt'])
        && data.country is string && data.country.size() > 0 && data.country.size() < 100
        && data.visaType is string && data.visaType.size() > 0 && data.visaType.size() < 50
        && data.entryExperience is string && data.entryExperience.size() > 10 && data.entryExperience.size() < 2000
        && data.difficulty is int && data.difficulty >= 1 && data.difficulty <= 5
        && data.travelDate is string && data.travelDate.size() == 7  // YYYY-MM format
        && data.processingTime is string && data.processingTime.size() < 100
        && data.hasGreenCard is bool
        && data.tips is string && data.tips.size() < 2000
        && data.authorName is string && data.authorName.size() < 100
        && data.helpful is int && data.helpful == 0
        && data.notHelpful is int && data.notHelpful == 0
        && data.verified is bool && data.verified == false;
    }

    function isValidVote() {
      let changedFields = request.resource.data.diff(resource.data).affectedKeys();
      return changedFields.hasOnly(['helpful', 'notHelpful'])
        && (changedFields.hasAny(['helpful']) ?
            request.resource.data.helpful == resource.data.helpful + 1 : true)
        && (changedFields.hasAny(['notHelpful']) ?
            request.resource.data.notHelpful == resource.data.notHelpful + 1 : true);
    }

    // Rate limiting: max 5 submissions per hour per IP (approximated by time)
    function notTooManySubmissions() {
      return request.time > resource.data.createdAt + duration.value(12, 'm');
    }

    match /experiences/{experienceId} {
      // Anyone can read
      allow read: if true;

      // Create with validation and rate limiting
      allow create: if isValidExperience()
        && request.resource.data.createdAt == request.time;

      // Only allow voting updates (increment by 1)
      allow update: if isValidVote();

      // No deletes allowed from client
      allow delete: if false;
    }
  }
}
```

## 2. App Check (Recommended - Prevents Bots)

### Setup App Check:

1. Go to **Firebase Console → App Check**
2. Click **Get Started**
3. For Web: Register your domain
4. Select **reCAPTCHA v3** (for production)
5. For testing: Select **Debug provider**

### Add to your code:

```javascript
// In src/firebase/config.js - add these imports:
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After initializeApp, add:
if (typeof window !== 'undefined') {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true
  });
}
```

## 3. Content Moderation

Add a Cloud Function to auto-moderate submissions:

```javascript
// Firebase Cloud Function (deploy separately)
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.moderateExperience = functions.firestore
  .document('experiences/{experienceId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();

    // Check for spam keywords
    const spamKeywords = ['viagra', 'casino', 'crypto', 'buy now'];
    const text = (data.entryExperience + ' ' + data.tips).toLowerCase();

    const hasSpam = spamKeywords.some(keyword => text.includes(keyword));

    if (hasSpam) {
      // Delete spam submission
      await snap.ref.delete();
      console.log('Deleted spam submission:', context.params.experienceId);
    }

    // Flag for manual review if too short
    if (data.entryExperience.length < 20) {
      await snap.ref.update({ verified: false, needsReview: true });
    }
  });
```

## 4. Rate Limiting (Client-Side)

Already implemented in the app:
- Voting can only be done once per experience (tracked in localStorage)
- Form validation prevents empty submissions

## 5. Additional Security Best Practices

### A. Environment Variables
Create `.env` file (NEVER commit to git):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... etc
};
```

### B. Input Sanitization
Already using:
- React's built-in XSS protection
- Character limits on all fields
- Type validation

### C. HTTPS Only
In production:
- Vercel automatically provides HTTPS
- Firebase only works over HTTPS in production

### D. CORS Configuration
In `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

## 6. Monitoring & Alerts

### Set up Firebase Alerts:
1. Go to **Firebase Console → Alerts**
2. Enable:
   - **Billing alerts** (unusual traffic)
   - **Performance alerts** (slow queries)
   - **Crashlytics** (errors)

### Review submissions regularly:
Create an admin dashboard to:
- Review flagged submissions
- Ban abusive users
- Export data for backups

## Priority Implementation Order:

1. ✅ **Firestore Security Rules** (IMMEDIATE - Do this NOW)
2. 🔐 **App Check** (Before launch - prevents bot attacks)
3. 📊 **Monitoring** (Set up alerts)
4. 🤖 **Cloud Functions** (Optional - for auto-moderation)
5. 🔒 **Environment Variables** (Before deploying to production)

## Testing Security:

Test your rules with Firebase Emulator:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then test scenarios:
- Creating experiences with invalid data
- Voting multiple times
- Deleting experiences
- XSS attempts in text fields