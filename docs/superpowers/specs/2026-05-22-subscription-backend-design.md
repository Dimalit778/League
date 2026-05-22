# Subscription Backend — Design Spec
**Date:** 2026-05-22  
**Scope:** RevenueCat webhook handler, DB schema cleanup, server-side league limit enforcement

---

## 1. Problem

Three gaps in the current subscription implementation:

1. **No server-side sync** — `subscription` rows are written manually by the app with a hardcoded `end_date = now + 1 month`. Apple manages renewals and cancellations; the app has no way to know when those happen. The DB will drift out of sync.
2. **Dead schema columns** — `access_advanced_stats` and `can_add_members` are always set to `true` and never read for access decisions. Gatekeeping uses `subscription_type` only.
3. **Client-only enforcement** — league creation limits are checked only in the app. A direct Supabase API call bypasses them.

---

## 2. Solution Overview

| Part | What | Where |
|------|------|--------|
| A | RevenueCat webhook Edge Function | `supabase/functions/revenuecat-webhook/index.ts` |
| B | DB migration | `supabase/migrations/20260522_subscription_cleanup.sql` |
| C | Server-side limit enforcement | `supabase/migrations/20260522_league_limit_rls.sql` |

---

## 3. Part A — RevenueCat Webhook Edge Function

### Location
`supabase/functions/revenuecat-webhook/index.ts`

### Trigger
RevenueCat dashboard → Webhooks → URL: `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`

### Authentication
RevenueCat sends `Authorization: <secret>` header. The Edge Function reads `REVENUECAT_WEBHOOK_SECRET` from env vars (set in Supabase dashboard → Settings → Edge Function Secrets) and rejects any request where the header does not match.

### Product Mapping
```
com.dimalit778.league.pro_monthly → BASIC
```
Defined as a constant at the top of the file — easy to extend with new products.

### Event Handling

| RevenueCat `event.type` | Action |
|-------------------------|--------|
| `INITIAL_PURCHASE` | Upsert subscription row: `subscription_type=BASIC`, `end_date` from `expiration_at_ms`, `product_id`, `transaction_id` |
| `RENEWAL` | Same upsert — updates `end_date` to new period |
| `CANCELLATION` | Upsert with `end_date` from `expiration_at_ms` — user retains access until period end |
| `EXPIRATION` | Update `end_date` to `NOW()` to revoke access immediately |
| `BILLING_ISSUES_DETECTED` | Update `end_date` to `NOW()` |
| `PRODUCT_CHANGE` | Upsert with new `subscription_type` |
| All other events | Return 200, no action |

### Idempotency
`transaction_id` column has a UNIQUE constraint. Duplicate webhooks for the same transaction are silently ignored via `ON CONFLICT (transaction_id) DO NOTHING` — except for RENEWAL events which use `ON CONFLICT (user_id) WHERE end_date > NOW() DO UPDATE SET end_date = ...`.

### User Identification
RevenueCat sends `event.app_user_id` = the value passed to `Purchases.logIn(userId)` in the app. This maps 1:1 to `users.id` (Supabase auth UUID).

### Supabase Client
Uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (auto-available in Edge Functions) to bypass RLS when writing subscription rows.

### Error Handling
- Missing/wrong Authorization → 401
- Unknown `app_user_id` → 200 (silent, user may have deleted account)
- DB error → 500 + logged to Supabase logs

---

## 4. Part B — DB Migration

### File
`supabase/migrations/20260522_subscription_cleanup.sql`

### Changes

```sql
-- Remove unused columns
ALTER TABLE public.subscription DROP COLUMN IF EXISTS access_advanced_stats;
ALTER TABLE public.subscription DROP COLUMN IF EXISTS can_add_members;

-- Add webhook tracking columns
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Prevent duplicate transactions
CREATE UNIQUE INDEX IF NOT EXISTS subscription_transaction_id_idx
  ON public.subscription(transaction_id)
  WHERE transaction_id IS NOT NULL;

-- At most one active subscription per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS subscription_user_active_idx
  ON public.subscription(user_id)
  WHERE end_date > NOW();
```

### TypeScript Types
After applying the migration, run `npm run sync-types` to regenerate `src/types/database.types.ts`.  
Then remove the `access_advanced_stats` and `can_add_members` fields from `src/features/subscription/types/index.ts` (`SubscriptionDetails` type).

---

## 5. Part C — Server-side Limit Enforcement

### File
`supabase/migrations/20260522_league_limit_rls.sql`

### DB Functions

**`get_user_league_limit(p_user_id uuid) → int`**  
Returns the max number of leagues the user is allowed to be a member of, based on their active subscription. Returns 1 for FREE (no active subscription row), 5 for BASIC/PREMIUM.

**`user_within_league_limit(p_user_id uuid) → boolean`**  
Counts current `league_members` rows for the user and compares against `get_user_league_limit`. Returns true if they can add one more.

Both functions use `SECURITY DEFINER` and `STABLE` so they execute with elevated permissions and are cached within a query.

### RLS Policy Update

Replace the existing `"Users: Create own league_members"` INSERT policy:

```sql
-- Old: WITH CHECK (user_id = auth.uid())
-- New:
WITH CHECK (
  user_id = auth.uid()
  AND public.user_within_league_limit(auth.uid())
)
```

This means the DB will reject any `league_members` INSERT that would exceed the limit, regardless of how the request arrives (app, direct API call, etc.).

### Limit Table (single source of truth)

The limits live in `get_user_league_limit` — this is the only place that defines the numbers. The app's `getSubscriptionLimits` in `getSubscriptionLimits.ts` must match these values (currently they do after the fix applied earlier: FREE=1, BASIC=5).

---

## 6. What This Does NOT Cover

- **PREMIUM enum value in DB** — left in place (safe, no existing data breakage). Can be removed in a future migration once confirmed no users have `subscription_type = 'PREMIUM'`.
- **Max members per league enforcement** — the `max_members` column on the `leagues` table already gates this at the Postgres level via the app logic. Not adding a new DB constraint for now.
- **App Store receipt validation** — RevenueCat handles this. We trust RevenueCat's webhook.

---

## 7. Environment Variables Required

| Variable | Where to set | Value |
|----------|-------------|-------|
| `REVENUECAT_WEBHOOK_SECRET` | Supabase → Edge Function Secrets | Generate in RevenueCat dashboard → Webhooks |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | EAS Secrets + local `.env` | From RevenueCat → App Settings → iOS |

---

## 8. RevenueCat Dashboard Setup (manual steps after deployment)

1. RevenueCat → Project → Webhooks → Add webhook URL
2. Copy the generated secret → paste into Supabase Edge Function Secrets as `REVENUECAT_WEBHOOK_SECRET`
3. Select events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUES_DETECTED`, `PRODUCT_CHANGE`
4. Test with RevenueCat's "Send test event" button

---

## 9. Testing Plan

- Unit test the Edge Function with mock webhook payloads for each event type
- Use RevenueCat's sandbox environment for end-to-end testing before production
- Verify idempotency: send the same webhook twice, confirm only one subscription row
- Verify RLS: attempt to INSERT a second `league_members` row as a FREE user via direct Supabase call, confirm 403
