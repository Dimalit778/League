# App Store Configuration Guide

## Step 1: Create Privacy Policy & Terms Pages

You need to host these pages somewhere accessible. Options:

### Option A: Use a Free Hosting Service
- **GitHub Pages**: Create a repo, add HTML files, enable Pages
- **Netlify**: Drag & drop HTML files
- **Vercel**: Deploy static HTML
- **Supabase Storage**: Host as static files

### Option B: Use Your Existing Domain
If you have a domain, host them there.

### Required Content

**Privacy Policy** (`privacy-policy.html`):
- What data you collect (user accounts, predictions, league data)
- How you use it (app functionality, analytics)
- Third-party services (Supabase, Sentry, Google OAuth)
- User rights (access, delete account)
- Contact information

**Terms of Service** (`terms-of-service.html`):
- User responsibilities
- League rules and conduct
- Prediction rules and scoring
- Account termination policies
- Limitation of liability

### Quick Template

You can use a privacy policy generator:
- https://www.freeprivacypolicy.com/
- https://www.privacypolicygenerator.info/

## Step 2: Update app.json

Once you have URLs, update `app.json` with:
```json
{
  "expo": {
    "privacyPolicy": "https://yourdomain.com/privacy-policy",
    "termsOfService": "https://yourdomain.com/terms-of-service"
  }
}
```

## Step 3: App Transport Security Cleanup

The current config allows insecure HTTP connections (security risk). We'll:
1. Remove `NSAllowsArbitraryLoads: true`
2. Keep only production domains (Supabase, Sentry)
3. Remove development-only IP addresses

