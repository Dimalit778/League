import { supabase } from '@/lib/supabase';
import { getSubscriptionLimits, isProPlan } from './getSubscriptionLimits';

type GuardResult = { canCreate: boolean; reason?: string };

async function getUserSubscriptionType(userId: string) {
  const { data } = await supabase
    .from('subscription')
    .select('subscription_type')
    .eq('user_id', userId)
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .maybeSingle();
  return data?.subscription_type ?? 'FREE';
}

async function getOwnedActiveLeagueCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('leagues')
    .select('id')
    .eq('owner_id', userId)
    .eq('status', 'ACTIVE');
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function canCreateLeague(userId: string): Promise<GuardResult> {
  try {
    const [subType, ownedCount] = await Promise.all([
      getUserSubscriptionType(userId),
      getOwnedActiveLeagueCount(userId),
    ]);
    const limits = getSubscriptionLimits(subType);
    if (ownedCount >= limits.ownedLeagues) {
      return {
        canCreate: false,
        reason: `You've reached your limit of ${limits.ownedLeagues} custom league${limits.ownedLeagues === 1 ? '' : 's'}. Upgrade to Pro to create more.`,
      };
    }
    return { canCreate: true };
  } catch {
    return { canCreate: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canCreateLeagueWithSize(userId: string, maxMembers: number): Promise<GuardResult> {
  try {
    const subType = await getUserSubscriptionType(userId);
    const limits = getSubscriptionLimits(subType);
    if (!(limits.allowedLeagueSizes as readonly number[]).includes(maxMembers)) {
      return {
        canCreate: false,
        reason: `League size ${maxMembers} requires a Pro subscription.`,
      };
    }
    return { canCreate: true };
  } catch {
    return { canCreate: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canInviteMember(userId: string, leagueId: string): Promise<GuardResult> {
  const { data: league, error } = await supabase
    .from('leagues')
    .select('status, owner_id')
    .eq('id', leagueId)
    .single();
  if (error || !league) return { canCreate: false, reason: 'League not found.' };
  if (league.status === 'LOCKED') {
    return { canCreate: false, reason: 'This league is locked. Upgrade to Pro to continue.' };
  }
  return { canCreate: true };
}

export async function canSubmitPrediction(userId: string, leagueId: string): Promise<GuardResult> {
  const { data: league, error } = await supabase
    .from('leagues')
    .select('status')
    .eq('id', leagueId)
    .single();
  if (error || !league) return { canCreate: false, reason: 'League not found.' };
  if (league.status === 'LOCKED') {
    return { canCreate: false, reason: 'This league is locked. Upgrade to Pro to continue.' };
  }
  return { canCreate: true };
}

export async function canViewAiTip(_userId: string): Promise<GuardResult> {
  // Placeholder — AI tips enforcement to be implemented separately
  return { canCreate: true };
}

export async function getUserPlan(userId: string): Promise<'FREE' | 'PRO'> {
  const subType = await getUserSubscriptionType(userId);
  return isProPlan(subType) ? 'PRO' : 'FREE';
}
