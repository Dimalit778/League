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
