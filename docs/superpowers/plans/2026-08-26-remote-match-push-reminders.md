# Remote Match Push Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send an iOS push notification ~60 minutes before kick-off for the upcoming matches of a user's primary-league competition, delivered even when the app is closed, replacing the on-device local scheduler.

**Architecture:** `pg_cron` invokes a `send-match-reminders` Edge Function every 10 minutes (gated to Israel local time ≥ 11:00). The function selects matches entering the 60-minute window, resolves recipients (users whose active primary league is on that competition and who have a stored `users.notification_token`), sends via the Expo Push API in batches, prunes dead tokens, and records one `match_push_reminders` row per match for idempotency. The client registers/clears its Expo push token on the existing "Match reminders" toggle.

**Tech Stack:** Expo React Native (expo-notifications), Supabase (Postgres, RLS, pg_cron, pg_net, Vault, Deno Edge Functions), Expo Push API, TypeScript, Jest (client), `deno test` (edge).

## Global Constraints

- **iOS only for v1.** Do not add Android/FCM config.
- **Remote only.** Remove the local match-reminder scheduler; do not run both.
- **Targeting:** a user is eligible for a match iff they have a `league_members` row with `is_primary = true AND active = true` whose league's `competition_id = match.competition_id`.
- **Preference = token presence.** Enable writes `users.notification_token`; disable/logout sets it to `null`. Reuse the existing `users.notification_token text` column — do NOT create a `user_push_tokens` table (multi-device is a follow-up).
- **Idempotency:** one `match_push_reminders` row per `match_id`; never send a match twice.
- **Eligibility window (correctness gate):** `status in ('SCHEDULED','TIMED') AND kick_off > now() AND kick_off <= now() + interval '60 minutes' AND not exists match_push_reminders`.
- **Cron:** `*/10 * * * *` (UTC), command gated with `where (now() at time zone 'Asia/Jerusalem')::time >= time '11:00'`. Vault secret name `sync_secret`; function env var `SYNC_SECRET`. Auth via `x-sync-secret` header, reusing `_shared/sync.ts` `requireSyncAuth`.
- **Push body language:** English for v1 (no per-user language column exists).
- **Expo Push endpoint:** `https://exp.host/--/api/v2/push/send`, chunks of ≤ 100 messages.
- **EAS credentials (manual, not code):** an APNs key must be configured via `eas credentials` before real delivery works. `expo-notifications` already injects the `aps-environment` entitlement.

---

## File Structure

- Create `supabase/migrations/<ts>_add_match_push_reminders.sql` — `match_push_reminders` table + RLS; `users.notification_token` self-update RLS policy.
- Create `supabase/functions/send-match-reminders/expoPush.ts` — pure helpers (message building, chunking, receipt parsing).
- Create `supabase/functions/send-match-reminders/expoPush.test.ts` — Deno tests for the pure helpers.
- Create `supabase/functions/send-match-reminders/index.ts` — orchestration (auth, queries, send, prune, mark).
- Create `supabase/migrations/<ts>_schedule_match_reminder_cron.sql` — cron job.
- Create `src/lib/notifications/pushToken.ts` — `registerPushToken` / `clearPushToken`.
- Create `src/lib/notifications/__tests__/pushToken.test.ts`.
- Modify `src/providers/NotificationProvider.tsx` — register on grant, clear on logout; drop local sync.
- Modify `src/features/settings/components/Settings/SettingsContent.tsx` — enable→register, disable→clear.
- Delete `src/features/notifications/utils/reminderScheduler.ts`, `src/features/notifications/utils/matchReminders.ts`, `src/features/notifications/utils/__tests__/matchReminders.test.ts`, `src/features/notifications/api/notificationsApi.ts`.
- Modify `app.json` — add `NSPrivacyCollectedDataTypeDeviceID` privacy manifest entry.
- Modify `scripts/audit-ios-privacy.cjs` — allow the DeviceID type.
- Modify `src/features/settings/content/legalContent.ts`, `public/privacy-policy/index.html` — push-token disclosure.
- Modify `docs/app-store-review-notes.md` — note remote push usage.
- Regenerate `src/types/database.types.ts` after the migrations.

---

### Task 1: Database migration — `match_push_reminders` + token RLS

**Files:**
- Create: `supabase/migrations/<ts>_add_match_push_reminders.sql`
- Modify: `src/types/database.types.ts` (regenerate)

**Interfaces:**
- Produces: table `public.match_push_reminders(match_id int PK → matches(id), sent_at timestamptz, recipient_count int)`; a self-update RLS policy on `public.users` permitting `auth.uid() = id`.

- [ ] **Step 1: Write the migration SQL**

Use a timestamped filename (e.g. `supabase migration new add_match_push_reminders` or `date +%Y%m%d%H%M%S`).

```sql
-- Idempotency ledger: one row per match that has had reminders sent.
create table if not exists public.match_push_reminders (
  match_id        integer primary key references public.matches(id) on delete cascade,
  sent_at         timestamptz not null default now(),
  recipient_count integer not null default 0
);

alter table public.match_push_reminders enable row level security;
-- No anon/authenticated policies: only the service role (Edge Function) touches it.

comment on table public.match_push_reminders is
  'Tracks which matches have already had 60-minute push reminders sent (idempotency).';

-- Let a signed-in user write their own push token. The Edge Function reads
-- tokens via the service role and bypasses RLS.
drop policy if exists "Users update own notification token" on public.users;
create policy "Users update own notification token"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

- [ ] **Step 2: Apply the migration**

Run (against the linked project; requires the Supabase CLI logged in):
`supabase db push`
Expected: migration applies with no error.

- [ ] **Step 3: Verify objects exist**

Run in the SQL editor (or `supabase db execute`):
```sql
select to_regclass('public.match_push_reminders') as tbl;
select polname from pg_policies where tablename = 'users' and polname = 'Users update own notification token';
```
Expected: `tbl` = `match_push_reminders`; the policy row is returned.

- [ ] **Step 4: Regenerate types**

Run: `npm run sync-types`
Expected: `src/types/database.types.ts` now contains a `match_push_reminders` entry.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/*_add_match_push_reminders.sql src/types/database.types.ts
git commit -m "feat(db): match_push_reminders table + notification_token RLS"
```

---

### Task 2: Expo push pure helpers (Deno) — TDD

**Files:**
- Create: `supabase/functions/send-match-reminders/expoPush.ts`
- Test: `supabase/functions/send-match-reminders/expoPush.test.ts`

**Interfaces:**
- Produces:
  - `type Recipient = { userId: string; token: string }`
  - `type MatchForPush = { id: number; leagueId: string | null; competitionId: number; homeName: string; awayName: string }`
  - `type ExpoMessage = { to: string; title: string; body: string; sound: 'default'; data: { type: 'match-reminder'; matchId: number; leagueId: string | null; competitionId: number } }`
  - `buildExpoMessages(match: MatchForPush, recipients: Recipient[]): ExpoMessage[]`
  - `chunkMessages(messages: ExpoMessage[], size?: number): ExpoMessage[][]` (default size 100)
  - `type ExpoTicket = { status: 'ok' | 'error'; id?: string; details?: { error?: string } }`
  - `invalidTokensFromTickets(messages: ExpoMessage[], tickets: ExpoTicket[]): string[]` (tokens whose ticket is `error` with `details.error === 'DeviceNotRegistered'`)

- [ ] **Step 1: Write the failing test**

```ts
// supabase/functions/send-match-reminders/expoPush.test.ts
import {
  buildExpoMessages,
  chunkMessages,
  invalidTokensFromTickets,
  type ExpoMessage,
  type MatchForPush,
  type Recipient,
} from './expoPush.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`Expected ${e}, received ${a}`);
};

const match: MatchForPush = {
  id: 42,
  leagueId: 'league-1',
  competitionId: 2021,
  homeName: 'Arsenal',
  awayName: 'Chelsea',
};

Deno.test('buildExpoMessages: one message per recipient with match data', () => {
  const recipients: Recipient[] = [
    { userId: 'u1', token: 'ExponentPushToken[a]' },
    { userId: 'u2', token: 'ExponentPushToken[b]' },
  ];
  const messages = buildExpoMessages(match, recipients);
  assertEquals(messages.length, 2);
  assertEquals(messages[0], {
    to: 'ExponentPushToken[a]',
    title: 'Match starts soon',
    body: 'Arsenal vs Chelsea',
    sound: 'default',
    data: { type: 'match-reminder', matchId: 42, leagueId: 'league-1', competitionId: 2021 },
  });
});

Deno.test('chunkMessages: splits into batches of at most 100', () => {
  const messages = Array.from({ length: 250 }, (_, i) => ({ to: `t${i}` })) as ExpoMessage[];
  const chunks = chunkMessages(messages);
  assertEquals(chunks.length, 3);
  assertEquals(chunks[0].length, 100);
  assertEquals(chunks[2].length, 50);
});

Deno.test('invalidTokensFromTickets: returns DeviceNotRegistered tokens', () => {
  const messages = [
    { to: 'ExponentPushToken[a]' },
    { to: 'ExponentPushToken[b]' },
    { to: 'ExponentPushToken[c]' },
  ] as ExpoMessage[];
  const tickets = [
    { status: 'ok', id: '1' },
    { status: 'error', details: { error: 'DeviceNotRegistered' } },
    { status: 'error', details: { error: 'MessageTooBig' } },
  ] as const;
  const invalid = invalidTokensFromTickets(messages, tickets as never);
  assertEquals(invalid, ['ExponentPushToken[b]']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `deno test supabase/functions/send-match-reminders/expoPush.test.ts`
Expected: FAIL (module `./expoPush.ts` not found).

- [ ] **Step 3: Write the implementation**

```ts
// supabase/functions/send-match-reminders/expoPush.ts
export type Recipient = { userId: string; token: string };

export type MatchForPush = {
  id: number;
  leagueId: string | null;
  competitionId: number;
  homeName: string;
  awayName: string;
};

export type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data: {
    type: 'match-reminder';
    matchId: number;
    leagueId: string | null;
    competitionId: number;
  };
};

export type ExpoTicket = {
  status: 'ok' | 'error';
  id?: string;
  details?: { error?: string };
};

export const buildExpoMessages = (match: MatchForPush, recipients: Recipient[]): ExpoMessage[] =>
  recipients.map((recipient) => ({
    to: recipient.token,
    title: 'Match starts soon',
    body: `${match.homeName} vs ${match.awayName}`,
    sound: 'default',
    data: {
      type: 'match-reminder',
      matchId: match.id,
      leagueId: match.leagueId,
      competitionId: match.competitionId,
    },
  }));

export const chunkMessages = (messages: ExpoMessage[], size = 100): ExpoMessage[][] => {
  const chunks: ExpoMessage[][] = [];
  for (let i = 0; i < messages.length; i += size) {
    chunks.push(messages.slice(i, i + size));
  }
  return chunks;
};

export const invalidTokensFromTickets = (messages: ExpoMessage[], tickets: ExpoTicket[]): string[] => {
  const invalid: string[] = [];
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      const message = messages[index];
      if (message) invalid.push(message.to);
    }
  });
  return invalid;
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `deno test supabase/functions/send-match-reminders/expoPush.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/send-match-reminders/expoPush.ts supabase/functions/send-match-reminders/expoPush.test.ts
git commit -m "feat(edge): expo push message helpers for match reminders"
```

---

### Task 3: Edge Function orchestration — `send-match-reminders/index.ts`

**Files:**
- Create: `supabase/functions/send-match-reminders/index.ts`

**Interfaces:**
- Consumes: `_shared/sync.ts` (`requireSyncAuth`, `createServiceClient`, `jsonResponse`, `must`); `./expoPush.ts` (`buildExpoMessages`, `chunkMessages`, `invalidTokensFromTickets`, types).
- Produces: an HTTP handler that, on authorized POST, sends due reminders and returns `{ success, matches, recipients }`.

- [ ] **Step 1: Write the function**

```ts
// supabase/functions/send-match-reminders/index.ts
// deno-lint-ignore-file no-explicit-any
import { createServiceClient, jsonResponse, requireSyncAuth } from '../_shared/sync.ts';
import {
  buildExpoMessages,
  chunkMessages,
  invalidTokensFromTickets,
  type ExpoMessage,
  type ExpoTicket,
  type MatchForPush,
  type Recipient,
} from './expoPush.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type MatchRow = {
  id: number;
  competition_id: number;
  kick_off: string;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
};

// Users whose active primary league is on the given competition and who have a token.
const getRecipients = async (supabase: any, competitionId: number): Promise<Recipient[]> => {
  const { data, error } = await supabase
    .from('league_members')
    .select('user_id, leagues!inner(competition_id), users!inner(notification_token)')
    .eq('is_primary', true)
    .eq('active', true)
    .eq('leagues.competition_id', competitionId)
    .not('users.notification_token', 'is', null);
  if (error) throw new Error(`getRecipients failed: ${error.message}`);

  const seen = new Set<string>();
  const recipients: Recipient[] = [];
  for (const row of (data ?? []) as any[]) {
    const token = row.users?.notification_token as string | null;
    if (token && !seen.has(token)) {
      seen.add(token);
      recipients.push({ userId: row.user_id, token });
    }
  }
  return recipients;
};

const sendChunk = async (chunk: ExpoMessage[]): Promise<ExpoTicket[]> => {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(chunk),
  });
  if (!response.ok) throw new Error(`Expo push HTTP ${response.status}`);
  const payload = await response.json();
  return (payload?.data ?? []) as ExpoTicket[];
};

const pruneTokens = async (supabase: any, tokens: string[]) => {
  if (tokens.length === 0) return;
  const { error } = await supabase.from('users').update({ notification_token: null }).in('notification_token', tokens);
  if (error) console.error(`pruneTokens failed: ${error.message}`);
};

Deno.serve(async (req) => {
  const unauthorized = requireSyncAuth(req);
  if (unauthorized) return unauthorized;

  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();
  const windowEndIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Eligible matches: entering the 60-minute window and not yet sent.
  const { data: matchRows, error: matchError } = await supabase
    .from('matches')
    .select(
      'id, competition_id, kick_off, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name), match_push_reminders!left(match_id)',
    )
    .in('status', ['SCHEDULED', 'TIMED'])
    .gt('kick_off', nowIso)
    .lte('kick_off', windowEndIso)
    .is('match_push_reminders.match_id', null);
  if (matchError) return jsonResponse({ success: false, message: matchError.message }, 500);

  let totalRecipients = 0;
  let processedMatches = 0;

  for (const row of (matchRows ?? []) as MatchRow[]) {
    if (!row.home_team?.name || !row.away_team?.name) continue;

    const recipients = await getRecipients(supabase, row.competition_id);

    // Resolve the primary league id for deep-linking (best-effort; may be null).
    const match: MatchForPush = {
      id: row.id,
      leagueId: null,
      competitionId: row.competition_id,
      homeName: row.home_team.name,
      awayName: row.away_team.name,
    };

    if (recipients.length > 0) {
      const messages = buildExpoMessages(match, recipients);
      for (const chunk of chunkMessages(messages)) {
        const tickets = await sendChunk(chunk);
        await pruneTokens(supabase, invalidTokensFromTickets(chunk, tickets));
      }
    }

    // Mark sent AFTER a successful send attempt so a crash lets the next run retry.
    const { error: insertError } = await supabase
      .from('match_push_reminders')
      .insert({ match_id: row.id, recipient_count: recipients.length });
    if (insertError) {
      console.error(`mark sent failed for match ${row.id}: ${insertError.message}`);
      continue;
    }

    processedMatches += 1;
    totalRecipients += recipients.length;
  }

  return jsonResponse({ success: true, matches: processedMatches, recipients: totalRecipients });
});
```

- [ ] **Step 2: Type-check the function**

Run: `deno check supabase/functions/send-match-reminders/index.ts`
Expected: no type errors.

- [ ] **Step 3: Deploy the function**

Run: `supabase functions deploy send-match-reminders`
Expected: deploy succeeds. Confirm `SYNC_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` are set for functions (they already are for the existing sync functions).

- [ ] **Step 4: Manual smoke test**

In the SQL editor, temporarily set a test match's `kick_off` to ~50 minutes out and set your own `users.notification_token` to a real Expo token from a device. Then invoke:
```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/send-match-reminders" -H "x-sync-secret: $SYNC_SECRET"
```
Expected: JSON `{ success: true, matches: >=1, recipients: >=1 }`, a push arrives on the device, and a `match_push_reminders` row exists. A second invocation returns `matches: 0` (idempotent).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/send-match-reminders/index.ts
git commit -m "feat(edge): send-match-reminders function"
```

---

### Task 4: Schedule the cron job

**Files:**
- Create: `supabase/migrations/<ts>_schedule_match_reminder_cron.sql`

**Interfaces:**
- Consumes: deployed `send-match-reminders` function; Vault secret `sync_secret`.
- Produces: a `cron.job` named `10 Min - send match reminders`.

- [ ] **Step 1: Write the migration**

Replace `<PROJECT_REF>` resolution to match the existing sync-cron migration's approach (it stores the full function URL in the command). Model it on `20260825155647_configure_match_sync_cron_jobs.sql`.

```sql
do $do$
declare
  v_base_url text;
begin
  if not exists (
    select 1 from vault.decrypted_secrets
    where name = 'sync_secret' and decrypted_secret is not null and decrypted_secret <> ''
  ) then
    raise exception 'Vault secret sync_secret is required for match reminder job';
  end if;

  -- Resolve the functions base URL from an existing sync job's command so we do
  -- not hardcode the project ref.
  select substring(command from '(https://[^'']+/functions/v1/)')
    into v_base_url
  from cron.job
  where command like '%/functions/v1/sync-today-matches%'
  limit 1;

  if v_base_url is null then
    raise exception 'Could not resolve functions base URL from existing cron jobs';
  end if;

  perform cron.unschedule('10 Min - send match reminders')
  where exists (select 1 from cron.job where jobname = '10 Min - send match reminders');

  perform cron.schedule(
    '10 Min - send match reminders',
    '*/10 * * * *',
    format(
      $command$
        select net.http_post(
          url := %L,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-sync-secret', (
              select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret' limit 1
            )
          ),
          body := '{}'::jsonb
        )
        where (now() at time zone 'Asia/Jerusalem')::time >= time '11:00';
      $command$,
      v_base_url || 'send-match-reminders'
    )
  );
end
$do$;
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push`
Expected: applies with no error.

- [ ] **Step 3: Verify the job**

Run:
```sql
select jobname, schedule, active from cron.job where jobname = '10 Min - send match reminders';
```
Expected: one row, schedule `*/10 * * * *`, `active = true`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/*_schedule_match_reminder_cron.sql
git commit -m "feat(db): cron to send match reminders every 10m (Israel 11:00+)"
```

---

### Task 5: Client push-token registration — TDD

**Files:**
- Create: `src/lib/notifications/pushToken.ts`
- Test: `src/lib/notifications/__tests__/pushToken.test.ts`

**Interfaces:**
- Consumes: `expo-notifications` `getExpoPushTokenAsync`; `@/lib/supabase` `supabase`; `@/store/AuthStore` `useAuthStore`.
- Produces:
  - `registerPushToken(): Promise<string | null>` — resolves the Expo token, writes it to the current user's `users.notification_token`, returns the token (or `null` on web / no user / failure).
  - `clearPushToken(): Promise<void>` — sets the current user's `users.notification_token` to `null`.

Note: `getExpoPushTokenAsync` needs the EAS `projectId`. Read it from `expo-constants` `Constants.expoConfig?.extra?.eas?.projectId`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/notifications/__tests__/pushToken.test.ts
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { registerPushToken, clearPushToken } from '../pushToken';

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'test-project-id' } } } },
}));

describe('pushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true });
  });

  it('registerPushToken writes the token to users.notification_token', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[x]' });
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const token = await registerPushToken();

    expect(token).toBe('ExponentPushToken[x]');
    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(update).toHaveBeenCalledWith({ notification_token: 'ExponentPushToken[x]' });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('clearPushToken nulls the token for the current user', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    await clearPushToken();

    expect(update).toHaveBeenCalledWith({ notification_token: null });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('registerPushToken returns null when there is no user', async () => {
    useAuthStore.setState({ user: null as any, isAuthenticated: false });
    const token = await registerPushToken();
    expect(token).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/lib/notifications/__tests__/pushToken.test.ts`
Expected: FAIL (module `../pushToken` not found).

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/notifications/pushToken.ts
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const getUserId = (): string | null => useAuthStore.getState().user?.id ?? null;

const getProjectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

// Resolve the device's Expo push token and persist it on the user's row.
// Returns the token, or null on web / signed-out / failure.
export const registerPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  const userId = getUserId();
  if (!userId) return null;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() });
    if (!token) return null;

    const { error } = await supabase.from('users').update({ notification_token: token }).eq('id', userId);
    if (error) {
      console.warn('[push] failed to store token:', error.message);
      return null;
    }
    return token;
  } catch (error) {
    console.warn('[push] getExpoPushTokenAsync failed:', error);
    return null;
  }
};

// Clear the stored token so the server stops targeting this user.
export const clearPushToken = async (): Promise<void> => {
  const userId = getUserId();
  if (!userId) return;
  const { error } = await supabase.from('users').update({ notification_token: null }).eq('id', userId);
  if (error) console.warn('[push] failed to clear token:', error.message);
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/lib/notifications/__tests__/pushToken.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/notifications/pushToken.ts src/lib/notifications/__tests__/pushToken.test.ts
git commit -m "feat(notifications): client Expo push-token register/clear"
```

---

### Task 6: Wire token lifecycle + remove local scheduler

**Files:**
- Modify: `src/providers/NotificationProvider.tsx`
- Modify: `src/features/settings/components/Settings/SettingsContent.tsx`
- Delete: `src/features/notifications/utils/reminderScheduler.ts`, `src/features/notifications/utils/matchReminders.ts`, `src/features/notifications/utils/__tests__/matchReminders.test.ts`, `src/features/notifications/api/notificationsApi.ts`

**Interfaces:**
- Consumes: `registerPushToken`, `clearPushToken` from `@/lib/notifications/pushToken`.

- [ ] **Step 1: Replace local sync with token registration in `NotificationProvider`**

Remove the imports and calls to `syncMatchReminders` / `cancelAllMatchReminders` and the `competitionId`-driven resync effect. Keep the notification handler, permission state, Android channel, and tap-to-navigate. Where the provider previously called `syncMatchReminders(...)` after permission was granted, call:

```ts
import { registerPushToken, clearPushToken } from '@/lib/notifications/pushToken';

// when permissionGranted becomes true (and on app foreground while granted):
void registerPushToken();

// on logout (isLoggedIn false):
void clearPushToken();
```

Delete the `FOREGROUND_RESYNC_MIN_INTERVAL_MS` throttling tied to the old sync if it now only guards token registration; a single `registerPushToken()` on grant + login is sufficient (upsert is cheap and idempotent).

- [ ] **Step 2: Update the Settings toggle handler**

In `SettingsContent.tsx`, where enabling reminders currently leads to local scheduling, call `registerPushToken()` after permission is granted; where disabling, call `clearPushToken()`. Keep the existing alerts (`Notifications enabled`, `Match reminders`, etc.).

- [ ] **Step 3: Delete the local scheduler files**

```bash
git rm src/features/notifications/utils/reminderScheduler.ts \
       src/features/notifications/utils/matchReminders.ts \
       src/features/notifications/utils/__tests__/matchReminders.test.ts \
       src/features/notifications/api/notificationsApi.ts
```

- [ ] **Step 4: Fix references and type-check**

Run: `npm run typecheck`
Expected: no errors. Resolve any remaining imports of the deleted modules (search: `grep -rn "reminderScheduler\|matchReminders\|notificationsApi" src`). The only remaining reference to `MATCH_REMINDER_TYPE` (used for tap navigation) should be inlined into `NotificationProvider` or kept in a tiny constant module; if `matchReminders.ts` was its only home, move `export const MATCH_REMINDER_TYPE = 'match-reminder';` into `NotificationProvider.tsx` or `src/lib/notifications.ts`.

- [ ] **Step 5: Run the full suite**

Run: `npm run test:ci`
Expected: PASS (the deleted `matchReminders.test.ts` no longer runs; no suite imports the removed modules).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(notifications): remote push token lifecycle, remove local scheduler"
```

---

### Task 7: Privacy manifest, legal, and review notes

**Files:**
- Modify: `app.json`
- Modify: `scripts/audit-ios-privacy.cjs`
- Modify: `src/features/settings/content/legalContent.ts`
- Modify: `public/privacy-policy/index.html`
- Modify: `docs/app-store-review-notes.md`

**Interfaces:** none (content + audit config).

- [ ] **Step 1: Add the DeviceID privacy type to `app.json`**

In `ios.privacyManifests.NSPrivacyCollectedDataTypes`, add:

```json
{
  "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeDeviceID",
  "NSPrivacyCollectedDataTypeLinked": true,
  "NSPrivacyCollectedDataTypeTracking": false,
  "NSPrivacyCollectedDataTypePurposes": [
    "NSPrivacyCollectedDataTypePurposeAppFunctionality"
  ]
}
```

- [ ] **Step 2: Allow the type in the audit script**

In `scripts/audit-ios-privacy.cjs`, add `'NSPrivacyCollectedDataTypeDeviceID'` to the allowed data-types set.

- [ ] **Step 3: Add a push disclosure to the privacy policy**

In `legalContent.ts` (Privacy Policy → "Information We Collect" or a new subsection) and the matching `public/privacy-policy/index.html`, add a sentence:

> "If you enable match reminders, we store a push notification token for your device to deliver reminders about upcoming matches. You can disable reminders at any time in Settings, which removes the token."

- [ ] **Step 4: Update review notes**

In `docs/app-store-review-notes.md`, under notifications, add:

> "Match reminders use remote push notifications (Apple Push Notification service). Enabling 'Match reminders' in Settings registers a push token; the server sends a reminder about one hour before each upcoming match of the user's primary league."

- [ ] **Step 5: Run the privacy audit + tests**

Run: `npm run audit:ios-privacy && npm run test:ci`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add app.json scripts/audit-ios-privacy.cjs src/features/settings/content/legalContent.ts public/privacy-policy/index.html docs/app-store-review-notes.md
git commit -m "docs(privacy): disclose push token collection for match reminders"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full quality gate**

Run: `npm run typecheck && npm run lint && npm run audit:i18n && npm run audit:ios-privacy && npm run test:ci`
Expected: all pass.

- [ ] **Step 2: Deno checks for the edge function**

Run: `deno test supabase/functions/send-match-reminders/expoPush.test.ts && deno check supabase/functions/send-match-reminders/index.ts`
Expected: pass / no errors.

- [ ] **Step 3: Confirm local scheduler is fully gone**

Run: `grep -rn "syncMatchReminders\|buildMatchReminders\|reminderScheduler\|scheduled-match-reminders" src`
Expected: no matches.

- [ ] **Step 4: Push branch and open PR**

```bash
git push -u origin feat/remote-match-push
gh pr create --base main --title "Remote match push reminders (iOS)" --body "Implements docs/superpowers/specs/2026-08-26-remote-match-push-reminders-design.md"
```

---

## Self-Review

**Spec coverage:**
- Remote-only + remove local scheduler → Task 6. ✓
- Primary-league targeting → Task 3 `getRecipients`. ✓
- Token-presence preference on `users.notification_token` → Tasks 1, 5, 6. ✓
- iOS-only → Global Constraints; no Android config added. ✓
- cron-pull every 10m, Israel 11:00 gate, vault `sync_secret` → Task 4. ✓
- 60-minute eligibility + idempotency → Tasks 1, 3. ✓
- Expo Push, chunk ≤100, prune DeviceNotRegistered → Tasks 2, 3. ✓
- APNs/entitlement (manual) → Global Constraints. ✓
- Privacy/legal/review-notes → Task 7. ✓
- Testing (pure Deno + client + manual device) → Tasks 2, 5, 3 step 4, 8. ✓

**Known follow-ups (out of scope, per spec):** Android/FCM, multi-device tokens, localized push body, deep-link `leagueId` in payload (currently `null`; navigation resolves by `matchId`).

**Type consistency:** `registerPushToken`/`clearPushToken` names match across Tasks 5–6; `buildExpoMessages`/`chunkMessages`/`invalidTokensFromTickets` and their types match across Tasks 2–3; `match_push_reminders(match_id)` matches across Tasks 1, 3, 4.
