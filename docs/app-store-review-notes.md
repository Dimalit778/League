# App Store Review Notes — Champo

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
Champo is an unofficial social football prediction app. Users join private leagues, predict match scores, and view leaderboards. There is no betting, gambling, or real-money prizes.

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

AI MATCH ANALYSIS
Some match detail screens include an AI-generated score preview and analysis. The card shows its update time and states that the content is for entertainment only, may be inaccurate, and is not betting advice. If the summary, both predicted scores, or generation timestamp are missing, the app shows "AI analysis is not available" and does not fabricate a 0:0 prediction. Full written analysis may require PRO.

ACCOUNT DELETION (Guideline 5.1.1v)
My Leagues → Settings (gear, top-left) → Delete Account → confirm.
The account and personal profile data are deleted. Sign in with Apple authorization is revoked when applicable. Historical predictions and points remain only as an unlinked "Deleted Player" record so league standings stay accurate. Deleting the account does not cancel an Apple subscription.
Do NOT delete the demo account during review unless testing deletion; re-run `npm run seed:app-reviewer` to recreate it.

USER-GENERATED CONTENT SAFETY (Guideline 1.2)
League names, member nicknames and profile photos are user-generated.
- Report a nickname or profile photo: open a member from the leaderboard → Safety actions → Report.
- Report a league name: Profile → Manage League → Report league name (non-owner members).
- Block a user: open the member → Safety actions → Block. Their profile, predictions and leaderboard entry are hidden.
- Manage blocked users: Settings → Blocked users.
- League owners can remove a member from Profile → Manage League.
Reports enter a private moderation queue available only to administrators. Moderators can dismiss a report, remove the reported content, or remove the member.

PRIVACY & LEGAL
Privacy Policy: https://[YOUR_DOMAIN]/privacy-policy/
Terms: https://[YOUR_DOMAIN]/terms-of-service/
In-app: Settings → Privacy Policy / Terms of Service
Support: support@champoapp.com

PERMISSIONS
Photo library: optional, only when updating profile avatar.
Notifications: optional local match reminders. Permission is requested only after the user opens Settings → Match reminders, reviews the explanation, and taps Enable reminders. Champo does not collect remote push tokens.
No IDFA / no cross-app tracking.

ADMIN FEATURES
The demo reviewer account is not an admin user and will not show an Admin Dashboard button.

AGE RATING
Set App Store age rating to 13+ to match our Terms of Service and Privacy Policy.

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
- [ ] Demo account is **not** an admin user (seed script removes admin access automatically)
- [ ] App Store age rating set to **13+**
- [ ] Notification permission status and the pre-permission explanation were verified on TestFlight
- [ ] AI available/unavailable states, update time and disclaimer were verified in English and Hebrew

## 4. App Store Connect metadata

### Age rating (step 21)
- Select **13+** in App Store Connect
- Rationale: Terms require users to be at least 13; app is not directed at children

### App Privacy questionnaire (steps 8 & 20)
- Declare Sentry crash/diagnostics data
- Local match reminders do not collect notification tokens; verify the final binary and App Privacy answers remain consistent with this behavior
- Photo library: declare only if you collect photos (optional avatar upload)

## 5. After review

- Rotate `APP_REVIEWER_PASSWORD` if it was exposed in App Store Connect history
- Re-run the seed script with a new password before the next submission
