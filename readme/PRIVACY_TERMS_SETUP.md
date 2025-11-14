# Privacy Policy & Terms of Service Setup

## ⚠️ ACTION REQUIRED

You need to replace the placeholder URLs in `app.json`:
- `"privacyPolicy": "https://yourdomain.com/privacy-policy"`
- `"termsOfService": "https://yourdomain.com/terms-of-service"`

## Quick Setup Options

### Option 1: GitHub Pages (Free & Easy)

1. **Create a new GitHub repository** (e.g., `league-app-legal`)

2. **Create `privacy-policy.html`**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - League App</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: [DATE]</p>
    
    <h2>Data We Collect</h2>
    <ul>
        <li>User account information (email, name)</li>
        <li>League memberships and predictions</li>
        <li>Profile avatars (stored securely)</li>
    </ul>
    
    <h2>How We Use Your Data</h2>
    <ul>
        <li>To provide app functionality</li>
        <li>To calculate league standings and scores</li>
        <li>For error tracking and app improvement (via Sentry)</li>
    </ul>
    
    <h2>Third-Party Services</h2>
    <ul>
        <li><strong>Supabase</strong>: Database and authentication backend</li>
        <li><strong>Sentry</strong>: Error tracking and crash reporting</li>
        <li><strong>Google</strong>: OAuth authentication</li>
    </ul>
    
    <h2>Your Rights</h2>
    <p>You can access, update, or delete your account data at any time through the app settings.</p>
    
    <h2>Contact</h2>
    <p>For privacy concerns, contact: [YOUR_EMAIL]</p>
</body>
</html>
```

3. **Create `terms-of-service.html`**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Terms of Service - League App</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Terms of Service</h1>
    <p>Last updated: [DATE]</p>
    
    <h2>Acceptance of Terms</h2>
    <p>By using League App, you agree to these terms.</p>
    
    <h2>User Responsibilities</h2>
    <ul>
        <li>Provide accurate information</li>
        <li>Maintain account security</li>
        <li>Respect other users</li>
        <li>Follow fair play rules</li>
    </ul>
    
    <h2>League Rules</h2>
    <ul>
        <li>Predictions must be submitted before match start</li>
        <li>Scoring: Exact score = 3 points, Correct result = 1 point</li>
        <li>No cheating or manipulation</li>
    </ul>
    
    <h2>Account Termination</h2>
    <p>We reserve the right to suspend accounts that violate these terms.</p>
    
    <h2>Limitation of Liability</h2>
    <p>League App is provided "as is" without warranties.</p>
    
    <h2>Contact</h2>
    <p>Questions? Contact: [YOUR_EMAIL]</p>
</body>
</html>
```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source branch (main/master)
   - Your URLs will be: `https://[username].github.io/league-app-legal/privacy-policy.html`

5. **Update app.json**:
```json
"privacyPolicy": "https://[username].github.io/league-app-legal/privacy-policy.html",
"termsOfService": "https://[username].github.io/league-app-legal/terms-of-service.html"
```

### Option 2: Use Privacy Policy Generator

1. Go to https://www.freeprivacypolicy.com/
2. Fill in your app details
3. Download HTML files
4. Host them (GitHub Pages, Netlify, etc.)
5. Update URLs in `app.json`

### Option 3: Supabase Storage (If You Have Storage Set Up)

1. Upload HTML files to a public Supabase Storage bucket
2. Get public URLs
3. Update `app.json` with those URLs

## After Setup

1. ✅ Update URLs in `app.json`
2. ✅ Test URLs are accessible
3. ✅ Verify URLs work on mobile browsers
4. ✅ Submit to App Store

## App Store Requirements

- ✅ Privacy Policy URL (required)
- ✅ Terms of Service URL (required)
- ✅ Both must be accessible without authentication
- ✅ Both must be HTTPS
- ✅ Both must be mobile-friendly

