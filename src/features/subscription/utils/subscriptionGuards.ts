import { supabase } from '@/lib/supabase';
import { getSubscriptionLimits, isPaidPlan } from './getSubscriptionLimits';

type GuardResult = { allowed: boolean; reason?: string };

async function getUserSubscriptionType(userId: string) {
  const { data, error } = await supabase
    .from('subscription')
    .select('subscription_type')
    .eq('user_id', userId)
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .maybeSingle();
  if (error) throw new Error(error.message);
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

async function getLeagueStatus(leagueId: string): Promise<'ACTIVE' | 'LOCKED' | null> {
  const { data, error } = await supabase
    .from('leagues')
    .select('status')
    .eq('id', leagueId)
    .single();
  if (error || !data) return null;
  return data.status as 'ACTIVE' | 'LOCKED';
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
        allowed: false,
        reason: `You've reached your limit of ${limits.ownedLeagues} custom league${limits.ownedLeagues === 1 ? '' : 's'}. Upgrade to Pro to create more.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canCreateLeagueWithSize(userId: string, maxMembers: number): Promise<GuardResult> {
  try {
    const subType = await getUserSubscriptionType(userId);
    const limits = getSubscriptionLimits(subType);
    if (!(limits.allowedLeagueSizes as readonly number[]).includes(maxMembers)) {
      return {
        allowed: false,
        reason: `League size ${maxMembers} requires a Pro subscription.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canInviteMember(_userId: string, leagueId: string): Promise<GuardResult> {
  const status = await getLeagueStatus(leagueId);
  if (status === null) return { allowed: false, reason: 'League not found.' };
  if (status === 'LOCKED') return { allowed: false, reason: 'This league is locked. Upgrade to Pro to continue.' };
  return { allowed: true };
}

export async function canSubmitPrediction(_userId: string, leagueId: string): Promise<GuardResult> {
  const status = await getLeagueStatus(leagueId);
  if (status === null) return { allowed: false, reason: 'League not found.' };
  if (status === 'LOCKED') return { allowed: false, reason: 'This league is locked. Upgrade to Pro to continue.' };
  return { allowed: true };
}

export async function canViewAiTip(_userId: string): Promise<GuardResult> {
  // TODO: implement weekly AI tip limit when AI tips feature is built
  return { allowed: true };
}

export async function getUserPlan(userId: string): Promise<'FREE' | 'PAID'> {
  const subType = await getUserSubscriptionType(userId);
  return isPaidPlan(subType) ? 'PAID' : 'FREE';
}
