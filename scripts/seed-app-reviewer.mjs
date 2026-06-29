/**
 * Seeds (or refreshes) the App Store reviewer demo account in Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... APP_REVIEWER_PASSWORD=... npm run seed:app-reviewer
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 * Never commit or ship the service role key in the mobile app.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REVIEWER_EMAIL = (process.env.APP_REVIEWER_EMAIL ?? 'reviewer@leaguechampion.app').trim().toLowerCase();
const REVIEWER_PASSWORD = process.env.APP_REVIEWER_PASSWORD;
const LEAGUE_NAME = process.env.APP_REVIEWER_LEAGUE_NAME ?? 'App Review League';
const REVIEWER_NICKNAME = process.env.APP_REVIEWER_NICKNAME ?? 'Reviewer';
const COMPETITION_ID = Number(process.env.APP_REVIEWER_COMPETITION_ID ?? '2021');
const SAMPLE_PREDICTIONS = Number(process.env.APP_REVIEWER_PREDICTIONS ?? '3');

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

async function findReviewerUserId(admin) {
  const { data, error } = await admin.from('users').select('id').eq('email', REVIEWER_EMAIL).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function ensureAuthUser(admin) {
  const existingId = await findReviewerUserId(admin);

  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password: REVIEWER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'App Reviewer' },
    });
    if (error) throw error;
    return existingId;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'App Reviewer' },
  });

  if (error) throw error;
  if (!data.user?.id) fail('Reviewer user was not created.');

  return data.user.id;
}

async function resolveCompetitionId(admin) {
  const { data: preferred, error: preferredError } = await admin
    .from('competitions')
    .select('id, name, is_free')
    .eq('id', COMPETITION_ID)
    .maybeSingle();

  if (preferredError) throw preferredError;
  if (preferred) return preferred.id;

  const { data: fallback, error: fallbackError } = await admin
    .from('competitions')
    .select('id, name')
    .eq('is_free', true)
    .order('id')
    .limit(1)
    .maybeSingle();

  if (fallbackError) throw fallbackError;
  if (!fallback) fail('No competitions found. Sync match data before seeding the reviewer account.');

  console.log(`Competition ${COMPETITION_ID} not found; using ${fallback.name} (${fallback.id}).`);
  return fallback.id;
}

async function ensureReviewLeague(admin, userId, competitionId) {
  const { data: existingLeague, error: existingError } = await admin
    .from('leagues')
    .select('id, join_code')
    .eq('owner_id', userId)
    .eq('name', LEAGUE_NAME)
    .maybeSingle();

  if (existingError) throw existingError;

  let leagueId = existingLeague?.id ?? null;
  let joinCode = existingLeague?.join_code ?? null;

  if (!leagueId) {
    joinCode = generateJoinCode();
    const { data: createdLeague, error: createLeagueError } = await admin
      .from('leagues')
      .insert({
        name: LEAGUE_NAME,
        owner_id: userId,
        join_code: joinCode,
        competition_id: competitionId,
        max_members: 6,
      })
      .select('id, join_code')
      .single();

    if (createLeagueError) throw createLeagueError;
    leagueId = createdLeague.id;
    joinCode = createdLeague.join_code;
  }

  const { data: member, error: memberError } = await admin
    .from('league_members')
    .select('id')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) throw memberError;

  let memberId = member?.id ?? null;

  if (!memberId) {
    await admin.from('league_members').update({ is_primary: false }).eq('user_id', userId);

    const { data: createdMember, error: createMemberError } = await admin
      .from('league_members')
      .insert({
        league_id: leagueId,
        user_id: userId,
        nickname: REVIEWER_NICKNAME,
        is_primary: true,
        active: true,
      })
      .select('id')
      .single();

    if (createMemberError) throw createMemberError;
    memberId = createdMember.id;
  } else {
    await admin.from('league_members').update({ is_primary: false }).eq('user_id', userId);
    await admin
      .from('league_members')
      .update({ is_primary: true, active: true, nickname: REVIEWER_NICKNAME })
      .eq('id', memberId);
  }

  return { leagueId, memberId, joinCode };
}

async function ensureSamplePredictions(admin, memberId, competitionId) {
  const { data: matches, error: matchesError } = await admin
    .from('matches')
    .select('id')
    .eq('competition_id', competitionId)
    .in('status', ['TIMED', 'SCHEDULED'])
    .order('kick_off', { ascending: true })
    .limit(SAMPLE_PREDICTIONS);

  if (matchesError) throw matchesError;
  if (!matches?.length) {
    console.log('No upcoming matches found; skipped sample predictions.');
    return 0;
  }

  const sampleScores = [
    { home_score: 2, away_score: 1 },
    { home_score: 1, away_score: 1 },
    { home_score: 0, away_score: 2 },
  ];

  let created = 0;

  for (const [index, match] of matches.entries()) {
    const scores = sampleScores[index % sampleScores.length];
    const { error } = await admin.from('predictions').upsert(
      {
        league_member_id: memberId,
        match_id: match.id,
        home_score: scores.home_score,
        away_score: scores.away_score,
        points: 0,
        is_finished: false,
      },
      { onConflict: 'league_member_id,match_id' },
    );

    if (error) throw error;
    created += 1;
  }

  return created;
}

async function main() {
  if (!SUPABASE_URL) fail('Set EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  if (!SERVICE_ROLE_KEY) fail('Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API).');
  if (!REVIEWER_PASSWORD || REVIEWER_PASSWORD.length < 8) {
    fail('Set APP_REVIEWER_PASSWORD to a secure password (min 8 characters).');
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Seeding App Store reviewer account...\n');

  const userId = await ensureAuthUser(admin);
  const competitionId = await resolveCompetitionId(admin);
  const { leagueId, memberId, joinCode } = await ensureReviewLeague(admin, userId, competitionId);
  const predictionsCreated = await ensureSamplePredictions(admin, memberId, competitionId);

  console.log('Reviewer account ready:\n');
  console.log(`  Email:        ${REVIEWER_EMAIL}`);
  console.log(`  Password:     ${REVIEWER_PASSWORD}`);
  console.log(`  League:       ${LEAGUE_NAME}`);
  console.log(`  Join code:    ${joinCode}`);
  console.log(`  League ID:    ${leagueId}`);
  console.log(`  Member ID:    ${memberId}`);
  console.log(`  Competition:  ${competitionId}`);
  console.log(`  Predictions:  ${predictionsCreated}`);
  console.log('\nCopy the App Review Notes template from docs/app-store-review-notes.md into App Store Connect.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
