/**
 * Seeds a batch of auth users into Supabase via the Admin API.
 *
 * Usage (loads EXPO_PUBLIC_SUPABASE_URL from .env.local, key passed inline):
 *   set -a; source .env.local; set +a
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-users.mjs
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 * Never commit or ship the service role key in the mobile app.
 *
 * The `handle_new_user` trigger auto-creates the matching public.users row and
 * copies user_metadata.full_name, so we only create the auth user here.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// League every seeded user is joined to. `nickname` must be unique within the
// league; it defaults to full_name below.
const LEAGUE_ID = 'b670618e-3bce-4402-a740-06c35622cf57';

const USERS = [
  { email: 'dani@gmail.com', password: 'dani123', full_name: 'dani ronik' },
  { email: 'john@gmail.com', password: 'john123', full_name: 'john delot' },
  { email: 'adam@gmail.com', password: 'adam123', full_name: 'adam linton' },
];

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

async function findUserIdByEmail(admin, email) {
  const { data, error } = await admin.from('users').select('id').eq('email', email).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertUser(admin, { email, password, full_name }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingId = await findUserIdByEmail(admin, normalizedEmail);

  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: { full_name, display_name: full_name },
    });
    if (error) throw error;
    return { email: normalizedEmail, id: existingId, action: 'updated' };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name, display_name: full_name },
  });
  if (error) throw error;
  if (!data.user?.id) fail(`User ${normalizedEmail} was not created.`);
  return { email: normalizedEmail, id: data.user.id, action: 'created' };
}

async function ensureLeagueExists(admin) {
  const { data, error } = await admin
    .from('leagues')
    .select('id, name, max_members')
    .eq('id', LEAGUE_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) fail(`League ${LEAGUE_ID} not found.`);

  const { count, error: countError } = await admin
    .from('league_members')
    .select('id', { count: 'exact', head: true })
    .eq('league_id', LEAGUE_ID);
  if (countError) throw countError;

  console.log(`League "${data.name}" — ${count}/${data.max_members ?? '?'} members before seeding.\n`);
  return data;
}

async function ensureMembership(admin, userId, nickname) {
  // Idempotent on the unique (user_id, league_id) constraint.
  const { data: existing, error: existingError } = await admin
    .from('league_members')
    .select('id')
    .eq('league_id', LEAGUE_ID)
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return 'member exists';

  // Make this the primary membership only if the user has no other primary.
  const { data: primary, error: primaryError } = await admin
    .from('league_members')
    .select('id')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle();
  if (primaryError) throw primaryError;

  const { error } = await admin.from('league_members').insert({
    league_id: LEAGUE_ID,
    user_id: userId,
    nickname,
    is_primary: !primary,
    active: true,
  });
  if (error) throw error;
  return primary ? 'joined' : 'joined (primary)';
}

async function main() {
  if (!SUPABASE_URL) fail('Set EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  if (!SERVICE_ROLE_KEY) fail('Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API).');

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Seeding ${USERS.length} users into ${SUPABASE_URL}...\n`);

  await ensureLeagueExists(admin);

  for (const user of USERS) {
    const result = await upsertUser(admin, user);
    const membership = await ensureMembership(admin, result.id, user.full_name);
    console.log(`  ${result.action.padEnd(7)} ${result.email.padEnd(18)} ${membership}`);
  }

  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
