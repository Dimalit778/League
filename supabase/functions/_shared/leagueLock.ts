import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/** Maximum number of custom leagues a FREE user may own and keep active. */
const FREE_OWNED_LEAGUES_LIMIT = 1;
/** Maximum number of custom leagues a PRO user may own and keep active. */
const PRO_OWNED_LEAGUES_LIMIT = 3;

export type LockReason = 'SUBSCRIPTION_EXPIRED' | 'FREE_LIMIT_EXCEEDED' | 'PRO_REQUIRED';

export async function lockLeague(
  supabase: SupabaseClient,
  leagueId: string,
  reason: LockReason
): Promise<void> {
  const { error } = await supabase
    .from('leagues')
    .update({ status: 'LOCKED', locked_reason: reason })
    .eq('id', leagueId);
  if (error) throw new Error(`Failed to lock league ${leagueId}: ${error.message}`);
}

export async function unlockLeague(
  supabase: SupabaseClient,
  leagueId: string
): Promise<void> {
  const { error } = await supabase
    .from('leagues')
    .update({ status: 'ACTIVE', locked_reason: null })
    .eq('id', leagueId);
  if (error) throw new Error(`Failed to unlock league ${leagueId}: ${error.message}`);
}

export async function applyDowngradeRules(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Fetch all leagues owned by this user, ordered by most recently updated first
  const { data: ownedLeagues, error } = await supabase
    .from('leagues')
    .select('id, status, updated_at')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch leagues for user ${userId}: ${error.message}`);
  if (!ownedLeagues || ownedLeagues.length <= FREE_OWNED_LEAGUES_LIMIT) return;

  // Keep the most recently updated league ACTIVE; lock the rest
  const toKeep = ownedLeagues[0];
  const toLock = ownedLeagues.slice(1);

  // Ensure the chosen league is ACTIVE (it may have been locked by a previous run)
  if (toKeep.status === 'LOCKED') {
    await unlockLeague(supabase, toKeep.id);
  }

  const toLockIds = toLock
    .filter((l) => l.status !== 'LOCKED')
    .map((l) => l.id);

  if (toLockIds.length > 0) {
    const { error: lockError } = await supabase
      .from('leagues')
      .update({ status: 'LOCKED', locked_reason: 'SUBSCRIPTION_EXPIRED' as const })
      .in('id', toLockIds);
    if (lockError) throw new Error(`Failed to lock leagues: ${lockError.message}`);
  }

  console.log(`Downgrade: kept league ${toKeep.id} active, locked ${toLockIds.length} leagues for user ${userId}`);
}

export async function applyUpgradeRules(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Unlock previously subscription-locked leagues up to PRO limit (3)
  const { data: lockedLeagues, error } = await supabase
    .from('leagues')
    .select('id, updated_at')
    .eq('owner_id', userId)
    .eq('status', 'LOCKED')
    .in('locked_reason', ['SUBSCRIPTION_EXPIRED', 'FREE_LIMIT_EXCEEDED'])
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch locked leagues for user ${userId}: ${error.message}`);
  if (!lockedLeagues || lockedLeagues.length === 0) return;

  // Count how many are already active
  const { data: activeLeagues, error: activeError } = await supabase
    .from('leagues')
    .select('id')
    .eq('owner_id', userId)
    .eq('status', 'ACTIVE');

  if (activeError) throw new Error(`Failed to count active leagues: ${activeError.message}`);

  const activeCount = activeLeagues?.length ?? 0;
  const slotsAvailable = PRO_OWNED_LEAGUES_LIMIT - activeCount;

  if (slotsAvailable <= 0) return;

  const toUnlock = lockedLeagues.slice(0, slotsAvailable);
  const toUnlockIds = toUnlock.map((l) => l.id);
  if (toUnlockIds.length > 0) {
    const { error: unlockError } = await supabase
      .from('leagues')
      .update({ status: 'ACTIVE', locked_reason: null })
      .in('id', toUnlockIds);
    if (unlockError) throw new Error(`Failed to unlock leagues: ${unlockError.message}`);
  }

  console.log(`Upgrade: unlocked ${toUnlock.length} leagues for user ${userId}`);
}
