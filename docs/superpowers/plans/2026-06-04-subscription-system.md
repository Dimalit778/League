# Subscription System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, flexible subscription system using RevenueCat + Supabase that enforces league creation limits server-side.

**Architecture:** RevenueCat webhooks update `users.subscription_tier` via a Supabase Edge Function. A `subscription_plans` table holds limits per tier. The `create_new_league_v3` DB function reads limits from that table — no client trust required.

**Tech Stack:** Supabase (Postgres, Edge Functions), RevenueCat Webhooks, TypeScript (Expo/React Native), TanStack Query

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/YYYYMMDD_subscription_system.sql` | Create | Add `subscription_tier` to `users`, create `subscription_plans` table, update DB function |
| `supabase/functions/revenuecat-webhook/index.ts` | Create | Edge Function: validate RC webhook → update `users.subscription_tier` |
| `src/features/leagues/api/leagueApi.ts` | Modify | Call `create_new_league_v3` instead of `create_new_league` |
| `src/types/database.types.ts` | Modify | Regenerate after migration (`npm run sync-types`) |

---

## Task 1: DB Migration — subscription_plans table + users.subscription_tier

**Files:**
- Create: `supabase/migrations/20260604000001_subscription_system.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260604000001_subscription_system.sql

-- 1. Add subscription_tier to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free';

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  tier         text PRIMARY KEY,
  max_leagues  int  NOT NULL,
  max_members  int  NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. Seed plans
INSERT INTO public.subscription_plans (tier, max_leagues, max_members) VALUES
  ('free', 2,  6),
  ('pro',  5, 12)
ON CONFLICT (tier) DO NOTHING;

-- 4. RLS: users can read plans, only service_role can write
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- 5. Drop old v3 function and replace with one that uses subscription_plans
DROP FUNCTION IF EXISTS public.create_new_league_v3(text, int, int, text, text);

CREATE OR REPLACE FUNCTION public.create_new_league_v3(
  league_name    text,
  max_members    int,
  competition_id int,
  nickname       text,
  avatar_url     text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id            uuid;
  v_join_code          text;
  v_league_id          uuid;
  v_tier               text;
  v_max_leagues        int;
  v_max_members_allowed int;
  v_total_leagues      int;
  v_is_free_competition boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get user tier and plan limits in one join
  SELECT u.subscription_tier, p.max_leagues, p.max_members
  INTO v_tier, v_max_leagues, v_max_members_allowed
  FROM public.users u
  JOIN public.subscription_plans p ON p.tier = u.subscription_tier
  WHERE u.id = v_user_id;

  IF v_tier IS NULL THEN
    -- Fallback: treat as free
    SELECT p.max_leagues, p.max_members
    INTO v_max_leagues, v_max_members_allowed
    FROM public.subscription_plans p
    WHERE p.tier = 'free';
  END IF;

  -- Check total leagues (owned + member)
  SELECT COUNT(*) INTO v_total_leagues
  FROM public.league_members
  WHERE user_id = v_user_id;

  IF v_total_leagues >= v_max_leagues THEN
    RAISE EXCEPTION 'Plan limit: you can be in at most % leagues', v_max_leagues;
  END IF;

  -- Check max_members against plan
  IF max_members > v_max_members_allowed THEN
    RAISE EXCEPTION 'Plan limit: max % members per league', v_max_members_allowed;
  END IF;

  -- Check competition is allowed for this tier
  SELECT c.is_free INTO v_is_free_competition
  FROM public.competitions c
  WHERE c.id = competition_id;

  IF v_is_free_competition IS NULL THEN
    RAISE EXCEPTION 'Competition not found';
  END IF;

  IF v_tier = 'free' AND NOT v_is_free_competition THEN
    RAISE EXCEPTION 'This competition requires a PRO subscription';
  END IF;

  -- Generate unique join_code
  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = v_join_code);
  END LOOP;

  -- Demote all current primary memberships
  UPDATE public.league_members
  SET is_primary = false
  WHERE user_id = v_user_id;

  -- Create the league
  INSERT INTO public.leagues (name, max_members, competition_id, owner_id, join_code)
  VALUES (league_name, max_members, competition_id, v_user_id, v_join_code)
  RETURNING id INTO v_league_id;

  -- Add creator as primary member
  INSERT INTO public.league_members (league_id, user_id, nickname, avatar_url, is_primary)
  VALUES (v_league_id, v_user_id, nickname, avatar_url, true);

  RETURN v_league_id;
END;
$$;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use `apply_migration` MCP tool with the SQL above targeting project `keuavfvgwhwckqordjbp`.

- [ ] **Step 3: Verify tables exist**

Run via MCP `execute_sql`:
```sql
SELECT tier, max_leagues, max_members FROM public.subscription_plans;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'subscription_tier';
```

Expected output:
```
tier | max_leagues | max_members
free |      2      |      6
pro  |      5      |     12

column_name        | data_type
subscription_tier  | text
```

---

## Task 2: RevenueCat Webhook Edge Function

**Files:**
- Create: `supabase/functions/revenuecat-webhook/index.ts`

- [ ] **Step 1: Create the Edge Function**

```typescript
// supabase/functions/revenuecat-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// RevenueCat event types that indicate an active PRO subscription
const PRO_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

// RevenueCat event types that indicate subscription ended
const FREE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
]);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Validate RevenueCat authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== REVENUECAT_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) {
    return new Response('Missing event', { status: 400 });
  }

  const eventType = event.type as string;
  const appUserId = event.app_user_id as string; // This is the Supabase user UUID

  if (!appUserId) {
    return new Response('Missing app_user_id', { status: 400 });
  }

  // Determine new tier
  let newTier: string | null = null;
  if (PRO_EVENTS.has(eventType)) {
    newTier = 'pro';
  } else if (FREE_EVENTS.has(eventType)) {
    newTier = 'free';
  }

  // Ignore events we don't care about
  if (newTier === null) {
    return new Response('Event ignored', { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: newTier, updated_at: new Date().toISOString() })
    .eq('id', appUserId);

  if (error) {
    console.error('Failed to update subscription_tier:', error);
    return new Response('Database error', { status: 500 });
  }

  console.log(`Updated user ${appUserId} to tier: ${newTier} (event: ${eventType})`);
  return new Response('OK', { status: 200 });
});
```

- [ ] **Step 2: Deploy the Edge Function via Supabase MCP**

Use `deploy_edge_function` MCP tool:
- function_name: `revenuecat-webhook`
- project_id: `keuavfvgwhwckqordjbp`

- [ ] **Step 3: Set Edge Function environment variable**

In Supabase Dashboard → Project Settings → Edge Functions → Add secret:
- Key: `REVENUECAT_WEBHOOK_SECRET`
- Value: A strong random string (e.g., `openssl rand -hex 32`)

- [ ] **Step 4: Configure RevenueCat Webhook**

In RevenueCat Dashboard → Project → Integrations → Webhooks:
- URL: `https://keuavfvgwhwckqordjbp.supabase.co/functions/v1/revenuecat-webhook`
- Authorization header value: same value as `REVENUECAT_WEBHOOK_SECRET`
- Events: select all (or at minimum: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE, UNCANCELLATION, PRODUCT_CHANGE)

**IMPORTANT:** RevenueCat's `app_user_id` must match the Supabase `auth.uid()`. Make sure you're identifying users in RevenueCat with their Supabase UUID:
```typescript
// When user logs in (in your auth flow):
await Purchases.logIn(supabaseUserId);
```

---

## Task 3: Update Client to Call create_new_league_v3

**Files:**
- Modify: `src/features/leagues/api/leagueApi.ts:147-157`

- [ ] **Step 1: Update createLeague to call v3**

In [src/features/leagues/api/leagueApi.ts](src/features/leagues/api/leagueApi.ts), change line 148:

```typescript
// Before
async createLeague(params: { league_name: string; max_members: number; competition_id: number; nickname: string }) {
  const { data, error } = await supabase.rpc('create_new_league', {
    league_name: params.league_name,
    max_members: params.max_members,
    competition_id: params.competition_id,
    nickname: params.nickname,
  });

  if (error) throw error;
  return data;
},

// After
async createLeague(params: {
  league_name: string;
  max_members: number;
  competition_id: number;
  nickname: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase.rpc('create_new_league_v3', {
    league_name: params.league_name,
    max_members: params.max_members,
    competition_id: params.competition_id,
    nickname: params.nickname,
    avatar_url: params.avatar_url ?? null,
  });

  if (error) throw error;
  return data;
},
```

- [ ] **Step 2: Regenerate TypeScript types**

```bash
npm run sync-types
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Error Handling in CreateLeague UI

**Files:**
- Modify: `src/features/leagues/screens/CreateLeagueScreen.tsx`

- [ ] **Step 1: Map server error messages to user-facing strings**

Find the `onSubmit` / mutation error handler in [src/features/leagues/screens/CreateLeagueScreen.tsx](src/features/leagues/screens/CreateLeagueScreen.tsx) and add error mapping:

```typescript
function getCreateLeagueErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('Plan limit: you can be in at most')) {
    return t('leagues.errors.tooManyLeagues');
  }
  if (msg.includes('Plan limit: max')) {
    return t('leagues.errors.tooManyMembers');
  }
  if (msg.includes('requires a PRO subscription')) {
    return t('leagues.errors.proRequired');
  }
  return t('common.errors.generic');
}
```

- [ ] **Step 2: Add translation keys**

In [src/lib/i18n/translations.ts](src/lib/i18n/translations.ts), add under `leagues`:

```typescript
errors: {
  tooManyLeagues: {
    en: 'You have reached your league limit. Upgrade to PRO for more leagues.',
    he: 'הגעת למגבלת הליגות שלך. שדרג ל-PRO לליגות נוספות.',
  },
  tooManyMembers: {
    en: 'Too many members for your plan. Upgrade to PRO for more members.',
    he: 'יותר מדי חברים עבור התוכנית שלך. שדרג ל-PRO לחברים נוספים.',
  },
  proRequired: {
    en: 'This competition requires a PRO subscription.',
    he: 'תחרות זו דורשת מנוי PRO.',
  },
},
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260604000001_subscription_system.sql \
        supabase/functions/revenuecat-webhook/index.ts \
        src/features/leagues/api/leagueApi.ts \
        src/lib/i18n/translations.ts \
        src/features/leagues/screens/CreateLeagueScreen.tsx \
        src/types/database.types.ts
git commit -m "feat: subscription system with RevenueCat webhook and per-plan league limits"
```

---

## Future: Changing Limits

To update limits in the future — no code changes needed:

```sql
-- Increase PRO to 10 leagues
UPDATE subscription_plans SET max_leagues = 10 WHERE tier = 'pro';

-- Add a new 'premium' tier
INSERT INTO subscription_plans (tier, max_leagues, max_members) VALUES ('premium', 20, 30);
UPDATE users SET subscription_tier = 'premium' WHERE id = '<user_id>';
```
