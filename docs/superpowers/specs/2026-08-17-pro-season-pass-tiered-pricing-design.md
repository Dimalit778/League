# Champo Pro — Season Pass

**Date:** 2026-08-17
**Status:** Superseded on 2026-08-18 — simplified to a single flat-price pass (see below).

## Update (2026-08-18): Simplified to one flat-price season pass

The monthly tiered-pricing model described in the rest of this document was **dropped before launch** in favor of the simplest possible design. What actually shipped:

- **One product, one price for the whole season** — a single **Consumable** IAP `champo_pro_season` (App Store / Google Play), re-purchasable each season. No monthly price tiers, no `champo_pro_mMM` products.
- **Season window is August → August** (leagues run Aug–Jun): `pro_seasons` current row `2026-27` = `2026-08-01 → 2027-08-01`.
- **Client** shows the single package (`selectProPackage`) whenever the season is active (`isSeasonActive(now, season)`), else a "no active season" state. The month-tier functions (`resolveSeasonMonth`, `selectMonthlyProPackage`) were removed.
- **Unchanged server machinery** (still the valuable part): `pro_seasons` + `get_current_season()`, the `sync-subscription` clamp of `expires_at` to the season end, and the server-first pro-gate — these align access to the Aug→Aug season regardless of purchase date.
- **RevenueCat:** offering `season_pass` (current) → one package → `champo_pro_season` (consumable). The 12 monthly products + `pro_season` offering were archived.

The finding about device-clock price manipulation is now **moot** — with a single flat price there is no cheaper tier to exploit.

Everything below is the original tiered design, kept for history.

---

## Goal

Turn Champo Pro into a **one-time season pass** that:

1. Grants access for a **full football season**: a fixed calendar window from July 1 to July 1 of the following year.
2. Is a **single non-renewing purchase per season** (no auto-renewal).
3. Gets **cheaper each month** as the season progresses — a buyer in November pays less than a buyer in July, because fewer months remain.

The access window is **fixed to the season end regardless of purchase date**: someone who buys in January still loses Pro on July 1, not one year after purchase.

## Background — current state

- Access is gated by the RevenueCat entitlement `pro`. The client checks it via `hasActiveEntitlement`.
- `sync-subscription` edge function reads RevenueCat and upserts `user_subscriptions { plan, status, expires_at, ... }`. Today `expires_at` = RevenueCat's `expires_date` (relative to purchase).
- Server RPC `get_user_plan` already treats a row as Pro only while `expires_at IS NULL OR expires_at > now()`. So a fixed `expires_at` is automatically respected by all server gates.
- The paywall (`ChamoPaywallModal.tsx`) already loads a **non-renewing** package, rejects auto-renewable products, and shows "One payment for the full season." `selectProPackage` currently picks the single package (or a configured id).
- The client pro-gate (`useEnsureProAccess`) relies on RevenueCat entitlement; the client does **not** read `user_subscriptions`.

## Key problem

RevenueCat non-renewing entitlements expire by a **relative duration** (X months from purchase), not a fixed calendar date. That cannot express "everyone loses Pro on July 1." The fixed boundary must be enforced by **our server**, and the **client must trust the server**, not only RevenueCat.

## Chosen approach (Approach 1): server-authoritative window

- The **server** stamps `expires_at = current season's end` for any Pro purchase. All server gates already honor it.
- The **client** pro-gate becomes **server-first**: it trusts the `plan`/expiry returned by `sync-subscription`, so a stale RevenueCat entitlement from a past season no longer keeps a user "Pro" into a new season.
- RevenueCat monthly products get a generous entitlement duration (≈1 year) only to represent ownership; the server clamps the upper bound to the season end.

Rejected: relying purely on RevenueCat durations (no fixed calendar date, needs corrective webhooks — fragile); auto-renewing yearly subscription (contradicts one-time-per-season + fixed July window).

## Design

### 1. Data model (Supabase)

**New table `pro_seasons`:**

| column | type | notes |
|--------|------|-------|
| id | bigint / uuid PK | |
| code | text UNIQUE | e.g. `2026-27` |
| starts_at | timestamptz | e.g. `2026-07-01T00:00:00Z` |
| ends_at | timestamptz | e.g. `2027-07-01T00:00:00Z` |
| is_current | boolean | exactly one `true` at any time |
| created_at | timestamptz default now() | |

- **Partial unique index** `ON pro_seasons (is_current) WHERE is_current` guarantees a single current season.
- **RLS:** `SELECT` for `authenticated` (client needs the window to choose the month tier); writes `service_role` only.
- **Function `get_current_season()`** (`SECURITY DEFINER`, `STABLE`) returns the current season row — one source of truth for both the edge function and the client.

**`user_subscriptions` change:** add `season_code text NULL` — records which season a purchase belongs to, so a past-season purchase is distinguishable from the current one and restore behaves correctly. No price columns; price lives in the stores.

**Season rollover:** flipping `is_current` is done manually in Supabase (or an admin script) once a year. No cron in this iteration (YAGNI); can be added later.

### 2. Store products & RevenueCat

- **12 non-renewing products**, one per month, **season-agnostic** so they are reused every season:
  `champo_pro_m07` (July, full price) … `champo_pro_m06` (June, cheapest).
- All attached to the **single `pro` entitlement** (code constant `PRO_ENTITLEMENT = 'pro'` is unchanged).
- All in **one offering** (`pro_season`) as 12 packages.
- Each product's RevenueCat entitlement duration is set generously (≈1 year) — ownership only; the calendar boundary is enforced server-side.
- **Prices (the monthly decrease) are set per product in App Store Connect and Google Play Console**, not in code. The "drop" is achieved by the app showing a different, cheaper product each month — not by scheduling a price change on one product.
- Configuration in both store dashboards + RevenueCat is **manual and one-time**; the same 12 products carry over each season untouched.

### 3. Paywall flow (client)

- **`selectMonthlyProPackage(packages, monthIndex)`** — pure function (replaces / extends `selectProPackage`):
  1. Find `champo_pro_m{MM}` matching the current month.
  2. Offering partial? Fall back to the nearest available month tier (not cheaper than the current month).
  3. Still nothing? Return `null` → "offer not available".
- **Month source:** `get_current_season()` (`starts_at`/`ends_at`) + the device date. The month index is derived **relative to `starts_at`** (July = 0 … June = 11) so changing the season window keeps the logic correct. The date is **injected** into the pure function, not read inside it, to keep it deterministic and testable.
- **Outside the season window** (before `starts_at` / after `ends_at`): no current tier → show "No active season right now", **no purchase button** — guards against accidental between-seasons sales.
- **`ChamoPaywallModal.tsx`** changes are small: still loads the offering, still rejects auto-renewable products, still shows the local `priceString`. Only the selection call moves to `selectMonthlyProPackage` with the month. The "One payment for the full season" copy stays accurate.

**Pro-gate fix — `useEnsureProAccess` becomes server-first:**

```
ensureProAccess():
  server = syncSubscriptionToServerUntilPro()   // source of truth
  if server.plan === 'pro' (and not expired) → true
  else → openPaywall()                          // includes the stale/expired-RC case
```

This closes the existing bug where a stale RevenueCat "active" entitlement plus a server `free` returned `false` **without opening the paywall**, leaving the user unable to re-purchase for a new season.

### 4. Server (edge function + DB)

**`sync-subscription` (`index.ts` ~line 175) — the one material change:**

```
1. season = get_current_season()  → { code, ends_at }
2. parsed = parseEntitlement(RC)   // plan still decided by RC: is there an active `pro` entitlement
3. upsert user_subscriptions:
     expires_at  = plan === 'pro' ? season.ends_at : parsed.expiresAt   // clamp to season end
     season_code = plan === 'pro' ? season.code    : null
     (all other fields as today)
```

- The calendar boundary is stamped **once, on the server**, regardless of purchase month. After July 1, `ends_at` is in the past → `get_user_plan` returns `free` on its own (already checks `expires_at > now()`). No other RPC changes.
- **Edge — purchase outside window:** if there is no current season, `sync` returns a controlled error and does **not** stamp Pro (aligned with the client blocking purchase).
- **Edge — restore of a past season:** RC returns an old entitlement, but `expires_at = ends_at` of that season is already in the past → server records `expired`/free; the user is guided to re-purchase. `season_code` distinguishes it.

**Migrations:**
1. Create `pro_seasons` + partial unique index + RLS + `get_current_season()`.
2. `ALTER user_subscriptions ADD COLUMN season_code text`.
3. Seed the current season `2026-27` (`2026-07-01` → `2027-07-01`, `is_current = true`).

### 5. Testing & observability

- **`selectMonthlyProPackage`** (pure unit): every month selects the right `mMM`; partial offering → fallback; outside window → `null`. Extends `selectProPackage.test.ts`.
- **Month-index calc:** July = 0 … June = 11 relative to `starts_at`; civil-year wrap (December → January).
- **`ChamoPaywallModal`:** correct tier price shown; "no active season" state blocks purchase. Updates `ChampoPaywallModal.test.tsx`.
- **`useEnsureProAccess`** (server-first): server `free` + RC `active` → paywall opens (bug regression test).
- **Server:** no real RevenueCat in tests — the `expires_at = ends_at` logic is verified against the parse; manual check against Supabase before deploy.

## Out of scope (YAGNI)

Season-rollover cron, dynamic pro-rating, refunds, "season ending soon" notification. Rollover = flip `is_current` manually.

## Files touched

- `supabase/migrations/*` — new `pro_seasons`, `get_current_season()`, `user_subscriptions.season_code`, seed.
- `supabase/functions/sync-subscription/index.ts` — clamp `expires_at` / write `season_code`.
- `src/features/subscription/screens/selectProPackage.ts` — `selectMonthlyProPackage`.
- `src/features/subscription/screens/ChamoPaywallModal.tsx` — month-based selection + "no active season" state.
- `src/features/subscription/hooks/useEnsureProAccess.ts` — server-first gate.
- Tests: `selectProPackage.test.ts`, `ChampoPaywallModal.test.tsx`, `useEnsureProAccess` (new).
- `src/types/database.types.ts` — regenerated (`npm run sync-types`).
- **Manual (out of code):** 12 IAP products in App Store Connect + Google Play, RevenueCat offering/entitlement wiring.
