# Subscription Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up RevenueCat webhooks so the Supabase `subscription` table stays in sync with Apple purchases, clean up the dead DB columns, and add a server-side RLS check that prevents users from exceeding their league limit.

**Architecture:** A Supabase Edge Function receives RevenueCat webhook events and upserts subscription rows using the service-role key (bypassing RLS). Two SQL migrations handle schema cleanup and RLS enforcement. TypeScript types are updated to match the new schema.

**Tech Stack:** Supabase Edge Functions (Deno), PostgreSQL RLS, React Native (Expo), TanStack Query, RevenueCat

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/revenuecat-webhook/index.ts` | Deno Edge Function — webhook handler |
| Create | `supabase/functions/revenuecat-webhook/index.test.ts` | Unit tests for handler logic |
| Create | `supabase/migrations/20260522_subscription_cleanup.sql` | Remove dead columns, add product_id / transaction_id |
| Create | `supabase/migrations/20260522_league_limit_rls.sql` | DB functions + updated INSERT policy |
| Modify | `src/types/database.types.ts` | Remove dead columns from Row/Insert/Update types |
| Modify | `src/features/subscription/types/index.ts` | Remove `access_advanced_stats`, `can_add_members` |
| Modify | `src/features/subscription/utils/getSubscriptionLimits.ts` | Remove dead fields from `getDefaultFreeSubscription` |
| Modify | `src/features/subscription/api/subscriptionApi.ts` | Remove dead fields from `createSubscription` insert |
| Modify | `src/features/subscription/api/__tests__/subscriptionApi.test.ts` | Remove dead field assertions |

---

## Task 1: DB Migration — Schema Cleanup

**Files:**
- Create: `supabase/migrations/20260522_subscription_cleanup.sql`
- Apply via Supabase MCP tool

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260522_subscription_cleanup.sql`:

```sql
-- Remove columns that duplicate subscription_type logic and are never read
ALTER TABLE public.subscription DROP COLUMN IF EXISTS access_advanced_stats;
ALTER TABLE public.subscription DROP COLUMN IF EXISTS can_add_members;

-- Add columns needed by RevenueCat webhook
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Prevent duplicate transactions (idempotent webhook delivery)
CREATE UNIQUE INDEX IF NOT EXISTS subscription_transaction_id_idx
  ON public.subscription(transaction_id)
  WHERE transaction_id IS NOT NULL;

-- Deduplicate: keep only the most recent row per user before adding UNIQUE constraint.
-- RevenueCat is the source of truth for history — we only need one row per user here.
DELETE FROM public.subscription s1
USING public.subscription s2
WHERE s1.user_id = s2.user_id
  AND s1.created_at < s2.created_at;

-- One subscription row per user — full UNIQUE required so Supabase JS upsert
-- can target the constraint with onConflict: 'user_id'.
ALTER TABLE public.subscription
  DROP CONSTRAINT IF EXISTS subscription_user_id_unique;
ALTER TABLE public.subscription
  ADD CONSTRAINT subscription_user_id_unique UNIQUE (user_id);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with:
- `name`: `subscription_cleanup`
- `query`: the SQL above

Verify the tool returns no error.

- [ ] **Step 3: Confirm columns exist / are gone**

Use `mcp__supabase__execute_sql` with:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subscription' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected: `id`, `user_id`, `subscription_type`, `start_date`, `end_date`, `created_at`, `updated_at`, `product_id`, `transaction_id` — NO `access_advanced_stats`, NO `can_add_members`.

- [ ] **Step 4: Commit the migration file**

```bash
git add supabase/migrations/20260522_subscription_cleanup.sql
git commit -m "feat(db): remove dead subscription columns, add product_id and transaction_id"
```

---

## Task 2: TypeScript Type Cleanup

**Files:**
- Modify: `src/types/database.types.ts`
- Modify: `src/features/subscription/types/index.ts`
- Modify: `src/features/subscription/utils/getSubscriptionLimits.ts`
- Modify: `src/features/subscription/api/subscriptionApi.ts`
- Modify: `src/features/subscription/api/__tests__/subscriptionApi.test.ts`

- [ ] **Step 1: Remove dead fields from `database.types.ts`**

In `src/types/database.types.ts`, find the `subscription` table definition. Remove the three occurrences of `access_advanced_stats` and `can_add_members` and add the two new columns:

```ts
// In Row:
Row: {
  created_at: string
  end_date: string
  id: string
  product_id: string | null        // ADD
  start_date: string
  subscription_type: Database["public"]["Enums"]["subscription_type"]
  transaction_id: string | null    // ADD
  updated_at: string
  user_id: string
  // REMOVED: access_advanced_stats, can_add_members
}

// In Insert:
Insert: {
  created_at?: string
  end_date: string
  id?: string
  product_id?: string | null       // ADD
  start_date: string
  subscription_type: Database["public"]["Enums"]["subscription_type"]
  transaction_id?: string | null   // ADD
  updated_at?: string
  user_id: string
  // REMOVED: access_advanced_stats, can_add_members
}

// In Update: same pattern — add product_id? and transaction_id?, remove the two dead fields
```

- [ ] **Step 2: Update `SubscriptionDetails` type**

In `src/features/subscription/types/index.ts`, replace:

```ts
type SubscriptionDetails = {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  start_date: string;
  end_date: string;
  product_id: string | null;
  transaction_id: string | null;
};
```

(Remove `access_advanced_stats` and `can_add_members`.)

- [ ] **Step 3: Update `getDefaultFreeSubscription`**

In `src/features/subscription/utils/getSubscriptionLimits.ts`, replace the return value:

```ts
export const getDefaultFreeSubscription = (userId: string): SubscriptionDetails => {
  return {
    id: 'free-' + userId,
    user_id: userId,
    subscription_type: 'FREE',
    start_date: new Date().toISOString(),
    end_date: new Date(2099, 11, 31).toISOString(),
    product_id: null,
    transaction_id: null,
  };
};
```

- [ ] **Step 4: Update `createSubscription` in `subscriptionApi.ts`**

In `src/features/subscription/api/subscriptionApi.ts`, remove `access_advanced_stats` and `can_add_members` from the insert payload. The insert becomes:

```ts
const { data, error } = await supabase
  .from('subscription')
  .insert({
    user_id: userId,
    subscription_type: subscriptionType,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  })
  .select()
  .single();
```

- [ ] **Step 5: Update the test file**

In `src/features/subscription/api/__tests__/subscriptionApi.test.ts`, replace the `getDefaultFreeSubscription` test:

```ts
describe('getDefaultFreeSubscription', () => {
  it('returns a free subscription for the given user', () => {
    const sub = subscriptionApi.getDefaultFreeSubscription('user-123');
    expect(sub.user_id).toBe('user-123');
    expect(sub.subscription_type).toBe('FREE');
    expect(sub.id).toBe('free-user-123');
    expect(sub.product_id).toBeNull();
    expect(sub.transaction_id).toBeNull();
  });

  it('sets a far future end date', () => {
    const sub = subscriptionApi.getDefaultFreeSubscription('user-123');
    const endDate = new Date(sub.end_date);
    expect(endDate.getFullYear()).toBeGreaterThanOrEqual(2099);
  });
});
```

- [ ] **Step 6: Run tests and confirm they pass**

```bash
npx jest --testPathPattern="src/features/subscription" --no-coverage
```

Expected output: all tests PASS with no TypeScript errors.

- [ ] **Step 7: Confirm no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep -i "subscription" | head -20
```

Expected: no output (no errors).

- [ ] **Step 8: Commit**

```bash
git add src/types/database.types.ts \
        src/features/subscription/types/index.ts \
        src/features/subscription/utils/getSubscriptionLimits.ts \
        src/features/subscription/api/subscriptionApi.ts \
        src/features/subscription/api/__tests__/subscriptionApi.test.ts
git commit -m "feat(subscription): remove dead DB columns from TypeScript types"
```

---

## Task 3: RevenueCat Webhook Edge Function

**Files:**
- Create: `supabase/functions/revenuecat-webhook/index.ts`
- Create: `supabase/functions/revenuecat-webhook/index.test.ts`

> **Note:** This Edge Function will sit idle until RevenueCat SDK is installed and the webhook URL is configured in the RevenueCat dashboard. The code is ready to deploy now.

- [ ] **Step 1: Write the failing test**

Create `supabase/functions/revenuecat-webhook/index.test.ts`:

```ts
import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { buildHandler } from './index.ts';

// Minimal fake Supabase client
function makeSupabase(upsertError: unknown = null, updateError: unknown = null) {
  return {
    from: (_: string) => ({
      upsert: (_data: unknown, _opts: unknown) => Promise.resolve({ error: upsertError }),
      update: (_data: unknown) => ({
        eq: (_: string, __: unknown) => ({
          gt: (_: string, __: unknown) => Promise.resolve({ error: updateError }),
        }),
      }),
    }),
  } as unknown as ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>;
}

const SECRET = 'test-secret';

function makeRequest(body: unknown, authHeader = SECRET) {
  return new Request('https://example.com/revenuecat-webhook', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const handler = buildHandler(SECRET, makeSupabase());

Deno.test('returns 401 when Authorization header is missing', async () => {
  const res = await handler(makeRequest({}, ''));
  assertEquals(res.status, 401);
});

Deno.test('returns 401 when Authorization header is wrong', async () => {
  const res = await handler(makeRequest({}, 'wrong-secret'));
  assertEquals(res.status, 401);
});

Deno.test('returns 400 when body has no event', async () => {
  const res = await handler(makeRequest({}));
  assertEquals(res.status, 400);
});

Deno.test('returns 200 and upserts on INITIAL_PURCHASE', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'INITIAL_PURCHASE',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
      id: 'txn-001',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 200 and upserts on RENEWAL', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'RENEWAL',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
      id: 'txn-002',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 200 and upserts on CANCELLATION with expiry date', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'CANCELLATION',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() + 15 * 24 * 60 * 60 * 1000,
      id: 'txn-003',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 200 and revokes on EXPIRATION', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'EXPIRATION',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() - 1000,
      id: 'txn-004',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 200 and revokes on BILLING_ISSUES_DETECTED', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'BILLING_ISSUES_DETECTED',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() - 1000,
      id: 'txn-005',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 200 and does nothing for unknown event types', async () => {
  const h = buildHandler(SECRET, makeSupabase());
  const res = await h(makeRequest({
    event: {
      type: 'TEST',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now(),
      id: 'txn-006',
    },
  }));
  assertEquals(res.status, 200);
});

Deno.test('returns 500 when DB upsert fails', async () => {
  const h = buildHandler(SECRET, makeSupabase({ message: 'db error' }));
  const res = await h(makeRequest({
    event: {
      type: 'INITIAL_PURCHASE',
      app_user_id: 'user-uuid-123',
      product_id: 'com.dimalit778.league.pro_monthly',
      expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
      id: 'txn-007',
    },
  }));
  assertEquals(res.status, 500);
});
```

- [ ] **Step 2: Run the test to confirm it fails (handler not implemented yet)**

```bash
cd supabase/functions/revenuecat-webhook
deno test --allow-net index.test.ts 2>&1 | head -20
```

Expected: error like `Cannot find module './index.ts'` or similar import failure.

- [ ] **Step 3: Write the Edge Function implementation**

Create `supabase/functions/revenuecat-webhook/index.ts`:

```ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Maps App Store product identifiers to subscription_type in the DB
const PRODUCT_TO_SUBSCRIPTION_TYPE: Record<string, string> = {
  'com.dimalit778.league.pro_monthly': 'BASIC',
};

// Events where the user should have/keep active access
const UPSERT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'CANCELLATION',
  'PRODUCT_CHANGE',
]);

// Events where access should be revoked immediately
const REVOKE_EVENTS = new Set(['EXPIRATION', 'BILLING_ISSUES_DETECTED']);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  product_id: string;
  expiration_at_ms: number;
  id: string;
}

export function buildHandler(
  webhookSecret: string,
  supabase: SupabaseClient,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    // 1. Auth check
    const auth = req.headers.get('Authorization');
    if (!webhookSecret || auth !== webhookSecret) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Parse body
    let body: { event?: RevenueCatEvent };
    try {
      body = await req.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const event = body?.event;
    if (!event?.type || !event?.app_user_id) {
      return new Response('Missing event', { status: 400 });
    }

    const { type, app_user_id: userId, product_id: productId, expiration_at_ms: expirationMs, id: transactionId } = event;

    // 3. Handle upsert events (user gets/keeps access)
    if (UPSERT_EVENTS.has(type)) {
      const subscriptionType = PRODUCT_TO_SUBSCRIPTION_TYPE[productId];
      if (!subscriptionType || !expirationMs) {
        // Unknown product or missing expiry — no-op
        return new Response('OK', { status: 200 });
      }

      const endDate = new Date(expirationMs).toISOString();

      const { error } = await supabase.from('subscription').upsert(
        {
          user_id: userId,
          subscription_type: subscriptionType,
          start_date: new Date().toISOString(),
          end_date: endDate,
          product_id: productId,
          transaction_id: transactionId,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        console.error('upsert error:', error);
        return new Response('Internal error', { status: 500 });
      }

      return new Response('OK', { status: 200 });
    }

    // 4. Handle revoke events (access ends now)
    if (REVOKE_EVENTS.has(type)) {
      const { error } = await supabase
        .from('subscription')
        .update({ end_date: new Date().toISOString() })
        .eq('user_id', userId)
        .gt('end_date', new Date().toISOString());

      if (error) {
        console.error('revoke error:', error);
        return new Response('Internal error', { status: 500 });
      }

      return new Response('OK', { status: 200 });
    }

    // 5. All other event types — no-op
    return new Response('OK', { status: 200 });
  };
}

// Entry point for Supabase Edge Runtime
const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

Deno.serve(buildHandler(webhookSecret, supabase));
```

- [ ] **Step 4: Run tests and confirm they all pass**

```bash
cd supabase/functions/revenuecat-webhook
deno test --allow-net index.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Deploy the Edge Function via Supabase MCP**

Use `mcp__supabase__deploy_edge_function` with:
- `name`: `revenuecat-webhook`
- `files`: the content of `index.ts`

Verify the tool returns a deployment URL like `https://<ref>.supabase.co/functions/v1/revenuecat-webhook`.

- [ ] **Step 6: Set the webhook secret in Supabase**

In the Supabase dashboard → Project Settings → Edge Functions → Secrets, add:
```
REVENUECAT_WEBHOOK_SECRET = <value from RevenueCat webhook dashboard>
```

(This is a manual step — cannot be done via MCP.)

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/revenuecat-webhook/
git commit -m "feat(webhook): add RevenueCat subscription webhook Edge Function"
```

---

## Task 4: Server-side RLS Enforcement

**Files:**
- Create: `supabase/migrations/20260522_league_limit_rls.sql`
- Apply via Supabase MCP

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260522_league_limit_rls.sql`:

```sql
-- ============================================================
-- get_user_league_limit
-- Returns max leagues allowed based on active subscription.
-- FREE (no active sub or explicit FREE) → 1
-- BASIC or PREMIUM → 5
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_league_limit(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  sub_type text;
BEGIN
  SELECT subscription_type INTO sub_type
  FROM public.subscription
  WHERE user_id = p_user_id
    AND end_date > NOW()
  ORDER BY end_date DESC
  LIMIT 1;

  IF sub_type IN ('BASIC', 'PREMIUM') THEN
    RETURN 5;
  ELSE
    RETURN 1;
  END IF;
END;
$$;

-- ============================================================
-- user_within_league_limit
-- Returns true if the user can join/create one more league.
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_within_league_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  current_count int;
  max_count int;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.league_members
  WHERE user_id = p_user_id;

  max_count := public.get_user_league_limit(p_user_id);
  RETURN current_count < max_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_league_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_within_league_limit(uuid) TO authenticated;

-- ============================================================
-- Update league_members INSERT policy to enforce the limit
-- ============================================================
DROP POLICY IF EXISTS "Users: Create own league_members" ON public.league_members;

CREATE POLICY "Users: Create own league_members"
  ON public.league_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_within_league_limit(auth.uid())
  );
```

- [ ] **Step 2: Verify the logic with a quick SQL check**

Before applying, think through the logic:
- A FREE user with 0 memberships: `0 < 1` → `true` → insert allowed ✓
- A FREE user with 1 membership: `1 < 1` → `false` → insert blocked ✓
- A BASIC user with 4 memberships: `4 < 5` → `true` → insert allowed ✓
- A BASIC user with 5 memberships: `5 < 5` → `false` → insert blocked ✓

- [ ] **Step 3: Apply the migration via Supabase MCP**

Use `mcp__supabase__apply_migration` with:
- `name`: `league_limit_rls`
- `query`: the SQL above

Verify the tool returns no error.

- [ ] **Step 4: Smoke-test the policy**

Use `mcp__supabase__execute_sql` to confirm the functions exist:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_league_limit', 'user_within_league_limit');
```

Expected: 2 rows returned.

```sql
-- Simulate a FREE user already in 1 league
SELECT public.user_within_league_limit(
  (SELECT id FROM auth.users LIMIT 1)
);
```

(Will return NULL if no users exist in test DB — that's fine for a smoke test.)

- [ ] **Step 5: Confirm the updated policy is in place**

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'league_members'
  AND policyname = 'Users: Create own league_members';
```

Expected: one row, `cmd = 'INSERT'`, `with_check` contains `user_within_league_limit`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260522_league_limit_rls.sql
git commit -m "feat(rls): enforce server-side league membership limit based on subscription"
```

---

## Manual Steps After Implementation (not automatable)

These require dashboard access and cannot be done via MCP or code:

1. **RevenueCat dashboard** → Webhooks → Add endpoint URL → copy the secret
2. **Supabase dashboard** → Project Settings → Edge Functions → Secrets → add `REVENUECAT_WEBHOOK_SECRET`
3. **RevenueCat dashboard** → Test the webhook using "Send test event" → verify the Supabase `subscription` table updates
4. **App Store Connect** → create the `com.dimalit778.league.pro_monthly` In-App Purchase product (subscription group, monthly, $3.99)

---

## Done Criteria

- [ ] DB has no `access_advanced_stats` or `can_add_members` columns
- [ ] DB has `product_id` and `transaction_id` columns on `subscription`
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] All subscription tests pass (`npx jest --testPathPattern="subscription"`)
- [ ] All 9 Edge Function tests pass (Deno)
- [ ] Edge Function is deployed and returns 401 for unauthenticated requests
- [ ] `user_within_league_limit` function exists in DB
- [ ] `league_members` INSERT policy checks the limit
