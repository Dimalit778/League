# Remote match push reminders — design

**Date:** 2026-08-26
**Status:** Approved design (pre-implementation)
**Author:** Dima + Claude

## Goal

Send each user a push notification **~60 minutes before kick-off** for the
upcoming matches of their **primary league's competition**, delivered even when
the app is fully closed. This replaces the existing on-device (local) reminder
scheduling with server-driven remote push.

## Decisions (locked)

- **Remote only.** The existing local match-reminder scheduling is removed.
  Remote push is the single source of truth (no dual-send / dedup problem).
- **Targeting: primary league only.** A user is eligible for a match's reminder
  when they have an `active`, `is_primary` `league_member` row whose league's
  `competition_id` equals the match's `competition_id` — identical scope to
  today's local behavior.
- **Preference model = token presence.** A registered Expo push token in the DB
  means "reminders on". Enabling "Match reminders" in Settings registers the
  token; disabling (or logout) clears it. No separate preference table.
- **Reuse the existing `users.notification_token` column** (already in the
  schema, currently unused — the vestige of the earlier "unwired push" attempt)
  as the single per-user token store. One token per user (one device) for v1;
  multi-device (a dedicated `user_push_tokens` table) is a follow-up.
- **iOS only for v1.** Android (FCM) is deferred to a separate follow-up.
- **Send mechanism: cron-pull (Approach A).** `pg_cron` invokes an Edge Function
  every 10 minutes; the function finds matches entering the 60-minute window and
  sends. Per-match idempotency guarantees one send per match.
- **Schedule window: 11:00–00:00 Israel time.** Implemented DST-safely by
  running the cron every 10 min (UTC) and gating the `net.http_post` with
  `where (now() at time zone 'Asia/Jerusalem')::time >= time '11:00'`, matching
  the existing pattern in `20260825155647_configure_match_sync_cron_jobs.sql`.
  The cron window is only an optimization; the per-match eligibility query is the
  real correctness gate, so a slightly wide window never sends a spurious push.

## Architecture

```
pg_cron (*/10 * * * *, gated to Israel >= 11:00)
        │  net.http_post + x-sync-secret (vault)
        ▼
Edge Function: send-match-reminders
        │  1. select eligible matches (kick_off in (now, now+60m], not sent)
        │  2. for each match → eligible users (primary+active league on comp) → tokens
        │  3. POST batches (≤100) to Expo Push API
        │  4. prune tokens returning DeviceNotRegistered
        │  5. insert match_push_reminders(match_id) — idempotency
        ▼
Expo Push Service → APNs → user devices
```

App side: register/delete the Expo push token when the user toggles
"Match reminders", tied to the existing permission flow.

## Data model

### Reuse: `users.notification_token`

The existing `users.notification_token text` column holds the user's single Expo
push token. Enable writes it; disable/logout sets it to `null`. Eligibility is
`users.notification_token is not null`.

- No new table, no new RLS. The user already updates their own `users` row under
  existing policies; confirm an `update` policy permits writing
  `notification_token` for `auth.uid() = id` (add/adjust if the current policy
  is column-restricted).
- The Edge Function reads tokens via the service role (bypasses RLS).
- Multi-device support (a dedicated `user_push_tokens` table with a token per
  device) is an explicit follow-up, not v1.

### New table: `match_push_reminders`

| column            | type          | notes                              |
|-------------------|---------------|------------------------------------|
| `match_id`        | same type as `matches.id` (int), PK | FK → `matches(id)` `on delete cascade`; unique = one send per match |
| `sent_at`         | `timestamptz` | `default now()`                    |
| `recipient_count` | `int`         | tokens the batch was sent to       |

- Presence of a `match_id` row = "already notified"; the eligibility query
  `left join`s / `not exists` against it.
- Service-role only (no RLS policy for anon/authenticated).

## Edge Function: `send-match-reminders`

Location: `supabase/functions/send-match-reminders/` (mirrors existing
`sync-*` functions and `_shared`).

**Auth:** validates `x-sync-secret` header against the `sync_secret` vault
value — same guard the existing sync functions use.

**Flow:**

1. **Eligible matches** (single SQL / RPC): `status in ('SCHEDULED','TIMED')`,
   `kick_off > now()`, `kick_off <= now() + interval '60 minutes'`,
   and `not exists (select 1 from match_push_reminders r where r.match_id = m.id)`.
2. For each eligible match, resolve recipients in one query:
   `matches m → leagues l (l.competition_id = m.competition_id)
    → league_members lm (lm.is_primary AND lm.active)
    → users u (u.id = lm.user_id AND u.notification_token is not null)`.
   Collect distinct `notification_token`s (with the owning `user_id` for pruning).
3. Build Expo push messages:
   `{ to, title: 'Match starts soon', body: '<home> vs <away>', sound: 'default',
      data: { type: 'match-reminder', matchId, leagueId, competitionId } }`.
   **v1 sends English** (there is no per-user language column, and the team names
   are the payload). Localization is a follow-up.
4. **Send** in chunks of ≤100 to `https://exp.host/--/api/v2/push/send`.
5. **Receipts:** collect ticket ids; on `DeviceNotRegistered` (or Expo
   `status: 'error'` with that code) set the offending user's
   `users.notification_token = null` so dead tokens are pruned.
6. **Idempotency:** insert one `match_push_reminders` row per match processed
   (even if 0 recipients, so we don't re-scan it every 10 min). Wrap match
   processing so a mid-batch failure does not mark a match sent.

**Idempotency ordering:** mark the match sent only after a successful POST
attempt for its batches. If the function crashes before marking, the next cron
run retries (at-least-once). Duplicate pushes for a match are prevented by the
`match_push_reminders` unique `match_id`.

## App changes

- **New:** `src/lib/notifications/pushToken.ts` (or extend `@/lib/notifications`)
  - `registerPushToken()`: `getExpoPushTokenAsync({ projectId })` using
    `app.json` `extra.eas.projectId`; write it to the current user's
    `users.notification_token`.
  - `clearPushToken()`: set `users.notification_token = null` for the current user.
- **`NotificationProvider`:** on `permission granted` (enable / app start),
  call `registerPushToken()`. On logout, call `clearPushToken()`. Keep the
  existing tap-to-navigate handling (`data.type === 'match-reminder'`).
- **Settings "Match reminders" toggle:** enable → request permission →
  `registerPushToken()`; disable → `clearPushToken()`.
- **Remove local scheduling:** delete `reminderScheduler.ts`,
  `buildMatchReminders`/`diffReminders` in `matchReminders.ts`, the
  `notifications:scheduled-match-reminders` snapshot, and the
  `syncMatchReminders`/`cancelAllMatchReminders` calls in `NotificationProvider`.
  Keep `MATCH_REMINDER_TYPE`, the notification handler, the Android channel
  setup, permission helpers, and navigation. `notificationsApi.getUpcomingMatches`
  moves server-side (into the Edge Function query) and is removed from the client.

## EAS / credentials (iOS)

- Configure an **APNs key** via `eas credentials` (iOS → Push Notifications).
- `expo-notifications` already injects the `aps-environment` entitlement — now
  justified (resolves the prior audit note that flagged an unused push
  entitlement). No `app.json` change required beyond the existing plugin.
- Store `EXPO_ACCESS_TOKEN` is **not** required for sending via the public Expo
  push endpoint, but set it if we later enable push security. Vault holds
  `sync_secret` (already present) for the cron→function auth.

## Privacy / legal / store

- Push tokens are a device identifier tied to a user. **Add** to the privacy
  policy (`legalContent.ts` + `public/privacy-policy`) and the iOS Privacy
  Manifest (`app.json` `NSPrivacyCollectedDataTypes`) a "Device ID / push token
  for notifications" entry (`NSPrivacyCollectedDataTypeDeviceID`, linked,
  purpose AppFunctionality).
- Update `docs/app-store-review-notes.md`: the app now uses remote push for
  match reminders (justifies the push entitlement).

## Error handling

- Function returns 401 on bad `x-sync-secret`.
- Expo API/network failure for a chunk: log to Sentry, do **not** mark those
  matches sent, let the next cron run retry.
- `DeviceNotRegistered` receipts prune tokens.
- 0 eligible matches → no-op 200.

## Testing

- **Unit (pure):** eligibility selection given `now` and a fixture set;
  recipient de-duplication; Expo message chunking (≤100); receipt-error →
  token-prune mapping. These live in `supabase/functions/send-match-reminders/`
  as testable pure helpers, mirrored where practical by client tests.
- **Client:** `registerPushToken` writes `users.notification_token` on enable;
  `clearPushToken` nulls it on disable/logout; tap navigation still resolves
  `matchId`.
- **Edge function:** local `supabase functions serve` invocation against seeded
  matches + tokens; assert `match_push_reminders` written and Expo endpoint
  called with expected payloads (mock fetch).
- **Manual:** real iOS device (TestFlight) — enable reminders, seed a match with
  kick-off ~65 min out, confirm push arrives ~60 min before. Simulator push is
  not reliable for this.

## Open questions / follow-ups

1. **Localization of the push body** — deferred. No per-user language column
   exists, so v1 sends English; a per-user language column + localized bodies
   is a follow-up.
2. **Android (FCM)** — separate follow-up spec.
3. **Late opt-in:** a user who enables reminders after a match's batch already
   ran won't get that match (acceptable for v1).
4. **Quiet cron cost:** every-10-min cron runs 24/7 but only POSTs during the
   Israel-time window; the empty runs are cheap `pg_cron` no-ops.

## Out of scope

- Android push, per-league/per-user granular preferences, notification history
  UI, non-match notification types, rich/media push, deep analytics.
