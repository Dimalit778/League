# Champo Pro Season-Pass Implementation Plan

> **Superseded on 2026-08-18.** This plan was executed, then the pricing model was simplified before launch to a **single flat-price season pass** (one Consumable IAP `champo_pro_season`, season window **August → August**). The 12 monthly tiers and the client month-selection logic (`resolveSeasonMonth` / `selectMonthlyProPackage`) were removed; the client now shows the single package while `isSeasonActive(now, season)` is true. The server machinery (`pro_seasons`, `get_current_season`, `expires_at` clamp, server-first gate) shipped unchanged. See the design spec's "Update (2026-08-18)" note for the final model. The task-by-task detail below is kept for history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Champo Pro a one-time season pass whose price drops each month and whose access always ends at a fixed calendar season boundary (July 1), enforced server-side.

**Architecture:** A `pro_seasons` table (one `is_current` row) is the single source of truth for the season window. The `sync-subscription` edge function clamps every Pro purchase's `expires_at` to the season end and records `season_code`. The paywall selects one of 12 season-agnostic monthly products (`champo_pro_mMM`) by the current calendar month. The client pro-gate becomes server-first so a stale RevenueCat entitlement can't keep a user Pro into a new season.

**Tech Stack:** Expo React Native, Supabase (Postgres + Deno edge functions), RevenueCat (`react-native-purchases`), TanStack Query, Jest (`jest-expo`).

## Global Constraints

- Entitlement code constant is unchanged: `PRO_ENTITLEMENT = 'pro'`.
- Monthly products are **season-agnostic and reused every season**: `champo_pro_m07` (July, full price) … `champo_pro_m06` (June, cheapest). Product-id prefix constant: `champo_pro_m`.
- Monthly products are **non-renewing** (never auto-renewable); the modal must keep rejecting `AUTO_RENEWABLE_SUBSCRIPTION`.
- The **fixed calendar boundary is enforced only server-side** (clamp `expires_at` to `season.ends_at`); RevenueCat durations are ownership-only.
- Exactly one `pro_seasons` row has `is_current = true` at any time (partial unique index).
- Initial season seed: code `2026-27`, `starts_at = 2026-07-01T00:00:00Z`, `ends_at = 2027-07-01T00:00:00Z`, `is_current = true`.
- Season rollover is **manual** (flip `is_current`); no cron in this iteration.
- All user-facing strings go through `t(...)` (`useTranslation`).
- Query keys come from `KEYS` in `src/lib/queryClient.ts`; never inline key arrays.

---

## File Structure

- `supabase/migrations/<ts>_add_pro_seasons.sql` — **create**: `pro_seasons` table, partial unique index, RLS, `get_current_season()`, `user_subscriptions.season_code`, seed.
- `supabase/functions/sync-subscription/index.ts` — **modify**: read current season, clamp `expires_at`, derive season-aware plan, write `season_code`, handle "no current season".
- `src/features/subscription/api/subscriptionApi.ts` — **modify**: add `getCurrentSeason()` + `ProSeason` type.
- `src/features/subscription/hooks/useCurrentSeason.ts` — **create**: TanStack Query wrapper.
- `src/features/subscription/screens/selectProPackage.ts` — **modify**: add `resolveSeasonMonth()` + `selectMonthlyProPackage()` (keep `selectProPackage` for now; the modal stops using it).
- `src/features/subscription/screens/ChamoPaywallModal.tsx` — **modify**: month-based selection + "no active season" state.
- `src/features/subscription/hooks/useEnsureProAccess.ts` — **modify**: server-first gate.
- `src/lib/queryClient.ts` — **modify**: add `KEYS.subscription.currentSeason`.
- `src/types/database.types.ts` — **regenerate** via `npm run sync-types`.
- Tests: `selectProPackage.test.ts` (extend), `ChampoPaywallModal.test.tsx` (extend), new `useEnsureProAccess.test.ts`, new `subscriptionApi.test.ts`.

---

## Task 1: Database — `pro_seasons`, `get_current_season()`, `season_code`, seed

**Files:**
- Create: `supabase/migrations/<timestamp>_add_pro_seasons.sql`
- Regenerate: `src/types/database.types.ts`

**Interfaces:**
- Produces (SQL): table `public.pro_seasons(id, code, starts_at, ends_at, is_current, created_at)`; function `public.get_current_season()` returning columns `code text, starts_at timestamptz, ends_at timestamptz`; column `public.user_subscriptions.season_code text`.
- Produces (TS, after regen): `Database['public']['Tables']['pro_seasons']['Row']`, `Database['public']['Functions']['get_current_season']`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/<timestamp>_add_pro_seasons.sql` (use a timestamp after the latest existing migration `20260816195857`):

```sql
-- Pro season windows: one current season drives the paywall month tier and the
-- fixed calendar expiry stamped onto Pro purchases.
create table public.pro_seasons (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint pro_seasons_window_valid check (ends_at > starts_at)
);

-- At most one current season at any time.
create unique index pro_seasons_single_current
  on public.pro_seasons (is_current)
  where is_current;

alter table public.pro_seasons enable row level security;

-- Any signed-in user may read the season window (needed to pick the month tier).
create policy "pro_seasons_read_authenticated"
  on public.pro_seasons for select
  to authenticated
  using (true);

-- Single source of truth for the current season, shared by client and edge fn.
create or replace function public.get_current_season()
returns table (code text, starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.code, s.starts_at, s.ends_at
  from public.pro_seasons s
  where s.is_current
  limit 1;
$$;

revoke all on function public.get_current_season() from public;
grant execute on function public.get_current_season() to authenticated;
grant execute on function public.get_current_season() to service_role;

-- Which season a Pro purchase belongs to (distinguishes past-season restores).
alter table public.user_subscriptions
  add column season_code text;

-- Seed the first season: 2026-27 (July 2026 -> July 2027).
insert into public.pro_seasons (code, starts_at, ends_at, is_current)
values ('2026-27', '2026-07-01T00:00:00Z', '2027-07-01T00:00:00Z', true);
```

- [ ] **Step 2: Apply the migration to Supabase**

Apply through the project's normal flow (Supabase MCP `apply_migration`, or `supabase db push` if the CLI is linked). Use the file contents above as the migration body.

- [ ] **Step 3: Verify the schema and seed**

Run (Supabase MCP `execute_sql`, or `psql`):

```sql
select code, starts_at, ends_at, is_current from public.pro_seasons;
select * from public.get_current_season();
select column_name from information_schema.columns
  where table_name = 'user_subscriptions' and column_name = 'season_code';
```

Expected: one `pro_seasons` row `2026-27` with `is_current = true`; `get_current_season()` returns that row's `code/starts_at/ends_at`; `season_code` column exists.

- [ ] **Step 4: Verify the single-current constraint**

Run:

```sql
insert into public.pro_seasons (code, starts_at, ends_at, is_current)
values ('2027-28', '2027-07-01T00:00:00Z', '2028-07-01T00:00:00Z', true);
```

Expected: FAIL with a unique-violation on `pro_seasons_single_current`. (Do not keep this row.)

- [ ] **Step 5: Regenerate database types**

Run:

```bash
npm run sync-types
```

Expected: `src/types/database.types.ts` now contains a `pro_seasons` table type and a `get_current_season` function type, plus `season_code` on `user_subscriptions`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations src/types/database.types.ts
git commit -m "feat(subscription): add pro_seasons table and get_current_season()"
```

---

## Task 2: Client API + query key + hook for the current season

**Files:**
- Modify: `src/features/subscription/api/subscriptionApi.ts`
- Modify: `src/lib/queryClient.ts`
- Create: `src/features/subscription/hooks/useCurrentSeason.ts`
- Create/Test: `src/features/subscription/api/__tests__/subscriptionApi.test.ts`

**Interfaces:**
- Consumes: `supabase.rpc('get_current_season')` (from Task 1).
- Produces:
  - `type ProSeason = { code: string; startsAt: string; endsAt: string }`
  - `getCurrentSeason(): Promise<ProSeason | null>`
  - `KEYS.subscription.currentSeason` → `['subscription', 'current-season']`
  - `useCurrentSeason(): { data: ProSeason | null | undefined; isLoading: boolean }`

- [ ] **Step 1: Write the failing test for `getCurrentSeason`**

Create `src/features/subscription/api/__tests__/subscriptionApi.test.ts`:

```typescript
import { getCurrentSeason } from '../subscriptionApi';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

const mockedRpc = supabase.rpc as jest.Mock;

describe('getCurrentSeason', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps the current season row to camelCase', async () => {
    mockedRpc.mockResolvedValue({
      data: [{ code: '2026-27', starts_at: '2026-07-01T00:00:00Z', ends_at: '2027-07-01T00:00:00Z' }],
      error: null,
    });

    await expect(getCurrentSeason()).resolves.toEqual({
      code: '2026-27',
      startsAt: '2026-07-01T00:00:00Z',
      endsAt: '2027-07-01T00:00:00Z',
    });
    expect(mockedRpc).toHaveBeenCalledWith('get_current_season');
  });

  it('returns null when there is no current season', async () => {
    mockedRpc.mockResolvedValue({ data: [], error: null });
    await expect(getCurrentSeason()).resolves.toBeNull();
  });

  it('throws a user-facing error when the query fails', async () => {
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getCurrentSeason()).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/features/subscription/api/__tests__/subscriptionApi.test.ts`
Expected: FAIL — `getCurrentSeason` is not exported.

- [ ] **Step 3: Implement `getCurrentSeason` + `ProSeason`**

In `src/features/subscription/api/subscriptionApi.ts`, add (keep the existing `syncSubscriptionToServer*` exports):

```typescript
export type ProSeason = {
  code: string;
  startsAt: string;
  endsAt: string;
};

export const getCurrentSeason = async (): Promise<ProSeason | null> => {
  const { data, error } = await supabase.rpc('get_current_season');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return null;
  }

  return { code: row.code, startsAt: row.starts_at, endsAt: row.ends_at };
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/features/subscription/api/__tests__/subscriptionApi.test.ts`
Expected: PASS (all three cases).

- [ ] **Step 5: Add the query key**

In `src/lib/queryClient.ts`, inside the `KEYS` object add a `subscription` group (if one does not already exist):

```typescript
  // ==================== SUBSCRIPTION ====================
  subscription: {
    currentSeason: ['subscription', 'current-season'] as const,
  },
```

- [ ] **Step 6: Implement the hook**

Create `src/features/subscription/hooks/useCurrentSeason.ts`:

```typescript
import { getCurrentSeason } from '@/features/subscription/api/subscriptionApi';
import { KEYS } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export const useCurrentSeason = () => {
  const { data, isLoading } = useQuery({
    queryKey: KEYS.subscription.currentSeason,
    queryFn: getCurrentSeason,
    staleTime: 60 * 60 * 1000, // 1h — the season window rarely changes.
  });

  return { season: data ?? null, isLoading };
};
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors from the changed files.

- [ ] **Step 8: Commit**

```bash
git add src/features/subscription/api src/features/subscription/hooks/useCurrentSeason.ts src/lib/queryClient.ts
git commit -m "feat(subscription): add getCurrentSeason API, key and hook"
```

---

## Task 3: Pure month-tier selection logic

**Files:**
- Modify: `src/features/subscription/screens/selectProPackage.ts`
- Modify/Test: `src/features/subscription/screens/__tests__/selectProPackage.test.ts`

**Interfaces:**
- Consumes: `ProSeason` shape `{ startsAt: string; endsAt: string }`; `PurchasesPackage` (has `.product.identifier`).
- Produces:
  - `PRO_MONTH_PRODUCT_PREFIX = 'champo_pro_m'`
  - `resolveSeasonMonth(now: Date, season: { startsAt: string; endsAt: string }): number | null` — returns the calendar month number `1..12` when `now` is inside `[startsAt, endsAt)`, else `null`.
  - `selectMonthlyProPackage(packages: readonly PurchasesPackage[], monthNumber: number, seasonStartMonth: number): PurchasesPackage | null` — exact tier for `monthNumber`, else the nearest **not-cheaper** available tier, else `null`.

Notes on ordering: "cheaper" tiers are later in the season. The elapsed index of a calendar month `m` given the season's start month `s` is `((m - s) + 12) % 12` (July-start ⇒ July = 0 … June = 11). The fallback picks the available tier with the **largest elapsed index ≤ the current month's elapsed index**, so we never charge a later (cheaper) price than the buyer's month warrants.

- [ ] **Step 1: Write the failing tests**

Add to `src/features/subscription/screens/__tests__/selectProPackage.test.ts`:

```typescript
import {
  PRO_MONTH_PRODUCT_PREFIX,
  resolveSeasonMonth,
  selectMonthlyProPackage,
} from '../selectProPackage';

const monthPackage = (mm: string) =>
  ({ identifier: `pkg_${mm}`, product: { identifier: `${PRO_MONTH_PRODUCT_PREFIX}${mm}` } }) as any;

const SEASON = { startsAt: '2026-07-01T00:00:00Z', endsAt: '2027-07-01T00:00:00Z' };

describe('resolveSeasonMonth', () => {
  it('returns the calendar month inside the season window', () => {
    expect(resolveSeasonMonth(new Date('2026-08-17T00:00:00Z'), SEASON)).toBe(8);
    expect(resolveSeasonMonth(new Date('2027-01-05T00:00:00Z'), SEASON)).toBe(1);
  });

  it('returns the start month exactly at starts_at', () => {
    expect(resolveSeasonMonth(new Date('2026-07-01T00:00:00Z'), SEASON)).toBe(7);
  });

  it('returns null before the season starts', () => {
    expect(resolveSeasonMonth(new Date('2026-06-30T23:59:59Z'), SEASON)).toBeNull();
  });

  it('returns null at/after the season end (ends_at is exclusive)', () => {
    expect(resolveSeasonMonth(new Date('2027-07-01T00:00:00Z'), SEASON)).toBeNull();
  });
});

describe('selectMonthlyProPackage', () => {
  const july = monthPackage('07');
  const august = monthPackage('08');
  const january = monthPackage('01');

  it('selects the exact month tier', () => {
    expect(selectMonthlyProPackage([july, august, january], 8, 7)).toBe(august);
  });

  it('falls back to the nearest not-cheaper tier when the exact month is missing', () => {
    // September (elapsed 2) missing -> use August (elapsed 1), not January (elapsed 6).
    expect(selectMonthlyProPackage([july, august, january], 9, 7)).toBe(august);
  });

  it('returns null when no tier at or before the month is available', () => {
    // Only January (elapsed 6) available, current month August (elapsed 1).
    expect(selectMonthlyProPackage([january], 8, 7)).toBeNull();
  });

  it('returns null for an empty offering', () => {
    expect(selectMonthlyProPackage([], 8, 7)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/features/subscription/screens/__tests__/selectProPackage.test.ts`
Expected: FAIL — new exports are not defined.

- [ ] **Step 3: Implement the pure logic**

Append to `src/features/subscription/screens/selectProPackage.ts` (keep the existing `selectProPackage`):

```typescript
export const PRO_MONTH_PRODUCT_PREFIX = 'champo_pro_m';

const monthNumberFromDate = (date: Date): number => date.getUTCMonth() + 1;

/** Calendar month (1..12) when `now` is inside [startsAt, endsAt); else null. */
export function resolveSeasonMonth(
  now: Date,
  season: { startsAt: string; endsAt: string },
): number | null {
  const start = new Date(season.startsAt).getTime();
  const end = new Date(season.endsAt).getTime();
  const t = now.getTime();

  if (t < start || t >= end) {
    return null;
  }
  return monthNumberFromDate(now);
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Months elapsed since the season start month (season start = 0 … 11). */
const elapsedIndex = (monthNumber: number, seasonStartMonth: number): number =>
  ((monthNumber - seasonStartMonth) + 12) % 12;

const productMonth = (pkg: PurchasesPackage): number | null => {
  const id = pkg.product.identifier;
  if (!id.startsWith(PRO_MONTH_PRODUCT_PREFIX)) return null;
  const mm = Number(id.slice(PRO_MONTH_PRODUCT_PREFIX.length));
  return Number.isInteger(mm) && mm >= 1 && mm <= 12 ? mm : null;
};

/**
 * Pick the tier for `monthNumber`; if that exact product is absent, fall back to
 * the nearest available tier that is NOT cheaper (elapsed index closest to, but
 * not beyond, the current month). Returns null when no eligible tier exists.
 */
export function selectMonthlyProPackage(
  packages: readonly PurchasesPackage[],
  monthNumber: number,
  seasonStartMonth: number,
): PurchasesPackage | null {
  const currentElapsed = elapsedIndex(monthNumber, seasonStartMonth);

  let best: PurchasesPackage | null = null;
  let bestElapsed = -1;

  for (const pkg of packages) {
    const mm = productMonth(pkg);
    if (mm === null) continue;

    const e = elapsedIndex(mm, seasonStartMonth);
    if (e > currentElapsed) continue; // cheaper/later tier — never undercharge.
    if (e > bestElapsed) {
      best = pkg;
      bestElapsed = e;
    }
  }

  return best;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/features/subscription/screens/__tests__/selectProPackage.test.ts`
Expected: PASS (existing `selectProPackage` cases + all new cases).

- [ ] **Step 5: Commit**

```bash
git add src/features/subscription/screens/selectProPackage.ts src/features/subscription/screens/__tests__/selectProPackage.test.ts
git commit -m "feat(subscription): add month-tier season pass selection logic"
```

---

## Task 4: Edge function — clamp expiry to season end + season-aware plan

**Files:**
- Modify: `supabase/functions/sync-subscription/index.ts`

**Interfaces:**
- Consumes: `public.get_current_season()` returning `{ code, starts_at, ends_at }`.
- Produces (unchanged response shape): `{ plan: 'pro' | 'free', status: string, expires_at: string | null }`, where for a Pro entitlement `expires_at` is the current season's `ends_at`, and `plan` reflects whether that clamped expiry is still in the future.

- [ ] **Step 1: Add a current-season fetch helper**

In `supabase/functions/sync-subscription/index.ts`, add near the other helpers:

```typescript
type CurrentSeason = { code: string; ends_at: string };

async function fetchCurrentSeason(
  adminClient: ReturnType<typeof createClient>,
): Promise<CurrentSeason | null> {
  const { data, error } = await adminClient.rpc('get_current_season');
  if (error) {
    console.error('Failed to fetch current season:', error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row ? { code: row.code, ends_at: row.ends_at } : null;
}
```

- [ ] **Step 2: Clamp expiry and derive the season-aware plan in the handler**

Replace the block that computes `parsed` and upserts `user_subscriptions` (currently around lines 171–192) with:

```typescript
  const rcData = revenueCatResult.data;
  const entitlement = rcData.subscriber?.entitlements?.[PRO_ENTITLEMENT];
  const parsed = parseEntitlement(entitlement);

  const season = await fetchCurrentSeason(adminClient);

  // A Pro entitlement is only honored inside a defined season window. The fixed
  // calendar boundary is the season end, regardless of when the pass was bought.
  let plan = parsed.plan;
  let status = parsed.status;
  let expiresAt = parsed.expiresAt;
  let seasonCode: string | null = null;

  if (parsed.plan === 'pro') {
    if (!season) {
      // No active season: do not grant Pro (aligned with the client blocking sale).
      plan = 'free';
      status = 'inactive';
      expiresAt = null;
    } else {
      expiresAt = season.ends_at;
      seasonCode = season.code;
      // Re-derive active state from the clamped, season-bounded expiry.
      if (new Date(season.ends_at).getTime() <= Date.now()) {
        plan = 'free';
        status = 'expired';
      }
    }
  }

  const { error } = await adminClient.from('user_subscriptions').upsert(
    {
      user_id: user.id,
      plan,
      status,
      entitlement_id: plan === 'pro' ? PRO_ENTITLEMENT : null,
      product_id: parsed.productId,
      revenuecat_app_user_id: rcData.subscriber?.original_app_user_id ?? user.id,
      expires_at: expiresAt,
      season_code: seasonCode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to upsert user_subscriptions:', error);
    return json({ error: 'Failed to sync subscription' }, 500);
  }

  return json({ plan, status, expires_at: expiresAt });
```

- [ ] **Step 3: Deploy the edge function**

Deploy through the project's flow (Supabase MCP `deploy_edge_function`, or `supabase functions deploy sync-subscription`).

- [ ] **Step 4: Manual verification**

With a sandbox/test RevenueCat user that owns a monthly product, invoke the function (via the app's post-purchase sync or a direct authorized call) and check the row:

```sql
select plan, status, expires_at, season_code from public.user_subscriptions
  where user_id = '<test-user-uuid>';
```

Expected: `plan = 'pro'`, `expires_at = 2027-07-01T00:00:00Z`, `season_code = '2026-27'` — regardless of the RevenueCat product's own expiry.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/sync-subscription/index.ts
git commit -m "feat(subscription): clamp Pro expiry to season end in sync-subscription"
```

---

## Task 5: Server-first pro-gate

**Files:**
- Modify: `src/features/subscription/hooks/useEnsureProAccess.ts`
- Create/Test: `src/features/subscription/hooks/__tests__/useEnsureProAccess.test.ts`

**Interfaces:**
- Consumes: `syncSubscriptionToServerUntilPro(): Promise<SyncSubscriptionResult | null>` (returns `{ plan, status, expires_at }`); `usePaywall()` → `openPaywall(): Promise<boolean>`; `useRevenueCatSubscription()` → `{ subscription, refreshCustomerInfo }`.
- Produces: `useEnsureProAccess()` → `{ isPro: boolean; openPaywall; ensureProAccess: () => Promise<boolean> }`, where `ensureProAccess` trusts the server plan first and opens the paywall whenever the server does not confirm Pro (including a stale/expired RevenueCat entitlement).

- [ ] **Step 1: Write the failing test**

Create `src/features/subscription/hooks/__tests__/useEnsureProAccess.test.ts`:

```typescript
import { renderHook } from '@testing-library/react-native';
import { useEnsureProAccess } from '../useEnsureProAccess';
import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';

const openPaywallMock = jest.fn();

jest.mock('@/features/subscription/api/subscriptionApi', () => ({
  syncSubscriptionToServerUntilPro: jest.fn(),
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  PRO_ENTITLEMENT: 'pro',
  hasActiveEntitlement: jest.fn(),
  usePaywall: () => openPaywallMock,
  useRevenueCatSubscription: () => ({
    subscription: { isActive: true },
    refreshCustomerInfo: jest.fn(),
  }),
}));

const mockedSync = syncSubscriptionToServerUntilPro as jest.Mock;

describe('useEnsureProAccess (server-first)', () => {
  afterEach(() => jest.clearAllMocks());

  it('grants access without opening the paywall when the server confirms Pro', async () => {
    mockedSync.mockResolvedValue({ plan: 'pro', status: 'active', expires_at: '2999-01-01T00:00:00Z' });
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(openPaywallMock).not.toHaveBeenCalled();
  });

  it('opens the paywall when the server says free even though RevenueCat looks active', async () => {
    mockedSync.mockResolvedValue({ plan: 'free', status: 'expired', expires_at: '2020-01-01T00:00:00Z' });
    openPaywallMock.mockResolvedValue(true);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(openPaywallMock).toHaveBeenCalledTimes(1);
  });

  it('opens the paywall when the server sync throws', async () => {
    mockedSync.mockRejectedValue(new Error('offline'));
    openPaywallMock.mockResolvedValue(false);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(false);
    expect(openPaywallMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/features/subscription/hooks/__tests__/useEnsureProAccess.test.ts`
Expected: FAIL — current implementation checks RevenueCat first and does not open the paywall on server `free`.

- [ ] **Step 3: Rewrite the gate to be server-first**

Replace the body of `ensureProAccess` in `src/features/subscription/hooks/useEnsureProAccess.ts`:

```typescript
  const ensureProAccess = async (): Promise<boolean> => {
    // Server is the source of truth for the season-bounded Pro window. A stale
    // RevenueCat entitlement (e.g. a past season) must not grant access.
    try {
      const serverResult = await syncSubscriptionToServerUntilPro();
      if (serverResult?.plan === 'pro') {
        return true;
      }
    } catch (error) {
      console.warn('[Subscription] Server pro check failed:', error);
    }

    // Server did not confirm Pro (free, expired season, or sync failure): let the
    // user (re)purchase. `openPaywall` resolves true only after the server confirms.
    return openPaywall();
  };
```

Remove the now-unused `hasActiveEntitlement` / `refreshCustomerInfo` / `PRO_ENTITLEMENT` imports if they are no longer referenced (keep `subscription` for `isPro`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/features/subscription/hooks/__tests__/useEnsureProAccess.test.ts`
Expected: PASS (all three cases).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (no unused-import errors from the edited file).

- [ ] **Step 6: Commit**

```bash
git add src/features/subscription/hooks/useEnsureProAccess.ts src/features/subscription/hooks/__tests__/useEnsureProAccess.test.ts
git commit -m "fix(subscription): make pro-gate server-first for season boundary"
```

---

## Task 6: Paywall — month-based selection + "no active season" state

**Files:**
- Modify: `src/features/subscription/screens/ChamoPaywallModal.tsx`
- Modify: `src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx`

**Interfaces:**
- Consumes: `useCurrentSeason()` → `{ season, isLoading }`; `resolveSeasonMonth`, `selectMonthlyProPackage` (Task 3).
- Produces: paywall that loads the monthly tier for the current season month, and renders a "no active season" state (no purchase button) when there is no current season or the current date is outside the window.

- [ ] **Step 1: Write the failing test for the no-active-season state**

Add to `src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx` (follow the file's existing mock/render setup; mock `useCurrentSeason` to return no season):

```typescript
import { useCurrentSeason } from '@/features/subscription/hooks/useCurrentSeason';

jest.mock('@/features/subscription/hooks/useCurrentSeason', () => ({
  useCurrentSeason: jest.fn(),
}));

const mockedUseCurrentSeason = useCurrentSeason as jest.Mock;

it('shows the no-active-season state and hides the purchase button when there is no current season', async () => {
  mockedUseCurrentSeason.mockReturnValue({ season: null, isLoading: false });

  const { queryByLabelText, getByText } = renderPaywall(); // use the file's existing render helper

  expect(getByText('No active season right now')).toBeTruthy();
  expect(queryByLabelText(/Upgrade for/)).toBeNull();
});
```

Also set the default `mockedUseCurrentSeason.mockReturnValue({ season: { code: '2026-27', startsAt: '2026-07-01T00:00:00Z', endsAt: '2027-07-01T00:00:00Z' }, isLoading: false })` in the existing `beforeEach`, so the current purchase-flow tests keep passing.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx`
Expected: FAIL — the no-active-season copy/branch does not exist yet.

- [ ] **Step 3: Wire the season + monthly selection into the modal**

In `src/features/subscription/screens/ChamoPaywallModal.tsx`:

1. Import the hook and helpers:

```typescript
import { useCurrentSeason } from '@/features/subscription/hooks/useCurrentSeason';
import { resolveSeasonMonth, selectMonthlyProPackage } from './selectProPackage';
```

2. Inside the component, read the season and derive the current tier month:

```typescript
  const { season, isLoading: isLoadingSeason } = useCurrentSeason();
  const seasonMonth = season ? resolveSeasonMonth(new Date(), season) : null;
  const seasonStartMonth = season ? new Date(season.startsAt).getUTCMonth() + 1 : null;
```

3. In `loadOffering`, replace the `selectProPackage(...)` call with the monthly selection (bail out when there is no active tier):

```typescript
      if (seasonMonth === null || seasonStartMonth === null) {
        setPurchasePackage(null);
        return;
      }

      const offerings = await Purchases.getOfferings();
      const selectedPackage = selectMonthlyProPackage(
        offerings.current?.availablePackages ?? [],
        seasonMonth,
        seasonStartMonth,
      );

      if (!selectedPackage) {
        throw new Error(t('The Champo Pro offer is not available right now.'));
      }
```

Add `seasonMonth` and `seasonStartMonth` to the `loadOffering` `useCallback` dependency array. Keep the existing `AUTO_RENEWABLE_SUBSCRIPTION` rejection and the `EXPO_PUBLIC_REVENUECAT_PRO_PACKAGE_ID` import can be removed (no longer used).

4. Render the "no active season" state. When `!isLoadingSeason && seasonMonth === null`, render an informational block instead of the purchase button. In the bottom bar, gate the purchase `Pressable` on `seasonMonth !== null`, and add:

```tsx
        {!isLoadingSeason && seasonMonth === null ? (
          <View className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Text className="text-center text-sm text-slate-300">
              {t('No active season right now')}
            </Text>
          </View>
        ) : (
          /* existing purchase button block */
        )}
```

5. Add the translation key. In `src/lib/i18n/translations.ts`, add `'No active season right now'` to the subscription section for both `en` and `he` (Hebrew: `'אין עונה פעילה כרגע'`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx`
Expected: PASS (no-active-season test + existing purchase-flow tests).

- [ ] **Step 5: Type-check and lint**

Run:

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors from the changed files.

- [ ] **Step 6: Commit**

```bash
git add src/features/subscription/screens/ChamoPaywallModal.tsx src/features/subscription/components/__tests__/ChampoPaywallModal.test.tsx src/lib/i18n/translations.ts
git commit -m "feat(subscription): select monthly tier and handle no active season in paywall"
```

---

## Task 7: Full-suite verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npx jest`
Expected: PASS, including `selectProPackage`, `subscriptionApi`, `useEnsureProAccess`, and `ChampoPaywallModal`.

- [ ] **Step 2: Type-check and lint the project**

Run:

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Manual smoke (store/RevenueCat side — out of code)**

Confirm the manual configuration exists so the offering resolves at runtime:
- 12 non-renewing products `champo_pro_m07`…`champo_pro_m06` created in App Store Connect and Google Play, each priced (July highest → June lowest).
- All attached to the `pro` entitlement and placed in one RevenueCat offering.

---

## Self-Review

**Spec coverage:**
- Fixed July→July window → Task 1 (`pro_seasons` seed), Task 4 (clamp `expires_at = ends_at`). ✓
- One-time non-renewing per season → existing modal keeps rejecting auto-renewable; Task 6 keeps that; `season_code` recorded (Task 1/4). ✓
- Monthly decreasing price → Task 3 (tier selection), Task 6 (wire-in), manual store prices (Global Constraints, Task 7). ✓
- Season source of truth in Supabase → Task 1 (`pro_seasons` + `get_current_season`). ✓
- Client trusts server (Approach 1) + bug fix → Task 5. ✓
- Outside-window guard → Task 3 (`resolveSeasonMonth` null), Task 4 (edge no-season), Task 6 (no-active-season UI). ✓
- Manual rollover, no cron → Global Constraints; no cron task. ✓
- Tests → Tasks 2/3/5/6 each include unit tests; Task 7 full suite. ✓

**Placeholder scan:** No TBD/TODO; all code steps include real code; fallback logic is fully specified. ✓

**Type consistency:** `ProSeason` uses `{ code, startsAt, endsAt }` (Task 2) and is consumed as `{ startsAt, endsAt }` by `resolveSeasonMonth` (Task 3) and `{ startsAt }` in the modal (Task 6). `getCurrentSeason` returns `ProSeason | null`; `useCurrentSeason` exposes `season`. Edge function uses snake_case (`ends_at`, `season_code`) matching SQL. `selectMonthlyProPackage(packages, monthNumber, seasonStartMonth)` signature matches its call in Task 6. ✓
