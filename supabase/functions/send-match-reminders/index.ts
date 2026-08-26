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

  for (const row of (matchRows ?? []) as unknown as MatchRow[]) {
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
