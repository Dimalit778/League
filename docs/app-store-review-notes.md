# App Store Review Notes — League Champion

Use this when submitting to App Store Connect. Paste the **Review Notes** block below into the submission form and replace placeholders after running the seed script.

## 1. Create the reviewer account (once per environment)

From the project root, with your **production** Supabase service role key:

```bash
export EXPO_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
export APP_REVIEWER_PASSWORD="ChooseAStrongReviewerPassword123!"

npm run seed:app-reviewer
```

The script is idempotent: safe to re-run before each submission to reset the password and refresh sample predictions.

### What the script sets up

- Email-verified user: `reviewer@leaguechampion.app` (override with `APP_REVIEWER_EMAIL`)
- Primary league: **App Review League**
- Sample predictions on upcoming fixtures (when match data exists)
- Free-plan access (no PRO subscription required for core review)

### Optional environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_REVIEWER_EMAIL` | `reviewer@leaguechampion.app` | Reviewer login email |
| `APP_REVIEWER_PASSWORD` | *(required)* | Reviewer password |
| `APP_REVIEWER_LEAGUE_NAME` | `App Review League` | Demo league name |
| `APP_REVIEWER_COMPETITION_ID` | `2021` | Competition ID (Premier League in tests) |
| `APP_REVIEWER_PREDICTIONS` | `3` | Number of sample predictions |

## 2. Paste into App Store Connect → App Review Information → Notes

```
League Champion is an unofficial social football prediction app. Users join private leagues, predict match scores, and view leaderboards. There is no betting, gambling, or real-money prizes.

DEMO ACCOUNT (email/password)
Email: reviewer@leaguechampion.app
Password: [paste APP_REVIEWER_PASSWORD used when running seed:app-reviewer]

HOW TO TEST
1. Launch the app → Get Started → Sign In.
2. Sign in with the demo email and password above (email is pre-verified; no OTP needed).
3. On My Leagues, open "App Review League".
4. Matches tab → pick an upcoming fixture → submit or edit a prediction.
5. Stats tab → view leaderboard.
6. Profile tab → edit nickname or avatar (optional).

SIGN IN WITH APPLE / GOOGLE
Also available on Sign In and Sign Up. Apple/Google sign-in does not require email OTP verification.

EMAIL/PASSWORD ACCOUNTS
New email accounts must enter the 6-digit verification code. The demo reviewer account is pre-verified when created with `npm run seed:app-reviewer`.

SUBSCRIPTIONS (optional)
Settings → Subscription → Upgrade (RevenueCat / Apple IAP).
PRO adds more leagues, larger leagues, and more competitions. Cancel via Apple ID → Subscriptions.

ACCOUNT DELETION (Guideline 5.1.1v)
My Leagues → Settings (gear, top-left) → Delete Account → confirm.
Do NOT delete the demo account during review unless testing deletion; re-run `npm run seed:app-reviewer` to recreate it.

PRIVACY & LEGAL
Privacy Policy: https://[YOUR_DOMAIN]/privacy-policy/
Terms: https://[YOUR_DOMAIN]/terms-of-service/
In-app: Settings → Privacy Policy / Terms of Service
Support: support@leaguechampion.app

PERMISSIONS
Photo library: optional, only when updating profile avatar.
No IDFA / no cross-app tracking.

THIRD-PARTY SERVICES
Supabase (auth/data), RevenueCat + Apple IAP (subscriptions), Sentry (crash diagnostics), third-party football data providers (fixtures/scores via our backend).
```

## 3. Pre-submission checklist

- [ ] Ran `npm run seed:app-reviewer` against **production** Supabase
- [ ] Confirmed demo login works on a TestFlight build
- [ ] Confirmed **App Review League** appears on My Leagues
- [ ] Confirmed at least one upcoming match is visible (sync jobs running)
- [ ] Privacy Policy URL is live and matches in-app policy
- [ ] Password in Review Notes matches the seeded account
- [ ] Demo account is **not** an admin user

## 4. After review

- Rotate `APP_REVIEWER_PASSWORD` if it was exposed in App Store Connect history
- Re-run the seed script with a new password before the next submission
