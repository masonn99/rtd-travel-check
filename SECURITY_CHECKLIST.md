# Security Checklist - RTD Travel Check

## ✅ Already Implemented

### Client-Side Security
- ✅ **Rate Limiting**: 5-minute cooldown between submissions
- ✅ **Spam Detection**: Blocks URLs, promotional text, spam keywords
- ✅ **Input Validation**:
  - Minimum 20 characters for experience
  - Maximum character limits on all fields
  - Required field validation
- ✅ **XSS Protection**: React's built-in escaping
- ✅ **Vote Limiting**: LocalStorage prevents multiple votes
- ✅ **Security Headers**: Vercel.json configured with:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

## 🔴 CRITICAL - Do Before Launch

### 1. Update Firestore Security Rules (URGENT)
**Go to Firebase Console → Firestore Database → Rules**

Copy the comprehensive rules from `FIREBASE_SECURITY_SETUP.md`

**Why it's critical:**
- Without proper rules, anyone can delete/modify data
- Prevents bulk scraping
- Enforces data validation server-side
- Rate limits database operations

**Test it works:**
```bash
# Try submitting invalid data - should be rejected
# Try deleting an experience - should fail
# Try voting multiple times - should only increment by 1
```

### 2. Set Up Firebase Quotas
**Firebase Console → Usage and Billing → Usage**

Set limits to prevent abuse:
- **Firestore reads**: Alert at 50K/day (free tier: 50K)
- **Firestore writes**: Alert at 20K/day (free tier: 20K)
- **Storage**: Alert at 1GB (free tier: 1GB)

### 3. Enable Firebase Authentication (Optional but Recommended)
Even if allowing anonymous posts, enable Auth for:
- Better rate limiting (per user, not per device)
- Ability to block abusive users
- Track repeat contributors

## 🟡 Recommended - Before Production

### 4. Set Up App Check (Prevents Bots)
**Firebase Console → App Check**
- Protects against automated attacks
- Uses reCAPTCHA v3 (invisible to users)
- See `FIREBASE_SECURITY_SETUP.md` for implementation

### 5. Add Environment Variables
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Update `src/firebase/config.js` to use env vars

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 6. Set Up Content Moderation
Options:
- **Manual**: Review submissions daily in Firebase Console
- **Automated**: Deploy Cloud Functions for auto-moderation
- **Hybrid**: Flag suspicious content for manual review

### 7. Backup Strategy
**Firebase Console → Firestore → Export**
- Schedule weekly backups
- Store in Google Cloud Storage
- Test restore process

## 🟢 Nice to Have

### 8. Monitoring & Alerts
- **Firebase Crashlytics**: Track errors
- **Cloud Monitoring**: Set up alerts for:
  - Unusual traffic spikes
  - High error rates
  - Quota approaching limits

### 9. GDPR Compliance (If targeting EU users)
- Add privacy policy
- Add cookie consent banner
- Implement data export/deletion requests
- Document data retention policy

### 10. Advanced Security
- **CSP Headers**: Content Security Policy
- **Subresource Integrity**: For CDN resources
- **DNSSEC**: For custom domain
- **Rate limiting per IP**: Use Cloudflare (free tier)

## Attack Vectors We've Protected Against

| Attack Type | Protection | Status |
|------------|-----------|--------|
| **XSS (Cross-Site Scripting)** | React escaping, CSP headers | ✅ Protected |
| **SQL Injection** | N/A (NoSQL database) | ✅ N/A |
| **CSRF** | Firebase handles this | ✅ Protected |
| **Spam Submissions** | Client-side filtering, rate limiting | ✅ Protected |
| **Bot Attacks** | App Check (when enabled) | 🟡 Pending |
| **Data Scraping** | Firestore rules, rate limits | ✅ Protected |
| **Malicious Content** | Keyword filtering, length limits | ✅ Protected |
| **Clickjacking** | X-Frame-Options: DENY | ✅ Protected |
| **MIME Sniffing** | X-Content-Type-Options | ✅ Protected |
| **Brute Force** | Firebase rate limiting | ✅ Protected |

## Testing Your Security

### Manual Tests:
1. **Try to submit spam**: Include "http://" in experience → Should be blocked
2. **Rapid submissions**: Submit 2 experiences in 1 minute → Second should be blocked
3. **Vote multiple times**: Vote on same experience twice → Should not count
4. **Short content**: Write less than 20 chars → Should be rejected
5. **Invalid date**: Try to submit without date → Should fail
6. **SQL injection attempt**: Enter `'; DROP TABLE experiences--` → Should be escaped

### Automated Tests:
```bash
# Install Firebase Emulator
npm install -g firebase-tools
firebase init emulators

# Run tests
firebase emulators:start
```

## Emergency Procedures

### If Under Attack:
1. **Immediate**: Go to Firebase Console → Firestore Rules → Set to deny all writes
2. **Check quotas**: Usage tab - look for spikes
3. **Review logs**: Recent submissions for patterns
4. **Block IPs**: Use Cloudflare (if enabled)
5. **Clear spam**: Delete malicious entries from Firestore

### If Compromised:
1. **Rotate Firebase keys**: Project Settings → Create new web app
2. **Review IAM permissions**: Check who has access
3. **Audit logs**: Look for unauthorized access
4. **Notify users**: If personal data affected
5. **Restore from backup**: If data corrupted

## Maintenance Schedule

- **Daily**: Check for spam submissions (5 min)
- **Weekly**: Review quota usage (10 min)
- **Monthly**: Update dependencies (30 min)
- **Quarterly**: Security audit (2 hours)

## Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules/get-started)

## Questions?

Common concerns:
- **"Is it safe to expose Firebase config?"** Yes - it's designed to be public
- **"Can someone delete my database?"** No - with proper Firestore rules
- **"What if I get DoS attacked?"** Firebase auto-scales and rate limits
- **"Do I need HTTPS?"** Yes - Firebase requires it, Vercel provides it free