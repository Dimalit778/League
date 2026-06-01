import { supabase } from '@/lib/supabase';
import {
  getSubscriptionLimits,
  isPaidPlan,
  normalizeSubscriptionPlan,
  type SubscriptionPlanInput,
} from './getSubscriptionLimits';

type GuardResult = { allowed: boolean; reason?: string };

async function getUserSubscriptionType(userId: string) {
  const { data, error } = await supabase
    .from('subscription')
    .select('type')
    .eq('user_id', userId)
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeSubscriptionPlan(
    data?.type as SubscriptionPlanInput,
  );
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

async function getMemberActive(
  userId: string,
  leagueId: string,
): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('league_members')
    .select('active')
    .eq('user_id', userId)
    .eq('league_id', leagueId)
    .maybeSingle();
  if (error || !data) return null;
  return data.active;
}

export async function canCreateLeague(userId: string): Promise<GuardResult> {
  try {
    const [subType, ownedCount] = await Promise.all([
      getUserSubscriptionType(userId),
      getOwnedActiveLeagueCount(userId),
    ]);
    const limits = getSubscriptionLimits(subType);
    if (ownedCount >= limits.maxLeagues) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${limits.maxLeagues} custom league${limits.maxLeagues === 1 ? '' : 's'}. Upgrade to create more.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canCreateLeagueWithSize(
  userId: string,
  maxMembers: number,
): Promise<GuardResult> {
  try {
    const subType = await getUserSubscriptionType(userId);
    const limits = getSubscriptionLimits(subType);
    if (!limits.maxMembersPerLeague.includes(maxMembers)) {
      return {
        allowed: false,
        reason: `League size ${maxMembers} requires an upgraded subscription.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Could not verify subscription status.' };
  }
}

export async function canInviteMember(
  userId: string,
  leagueId: string,
): Promise<GuardResult> {
  const active = await getMemberActive(userId, leagueId);
  if (active === null)
    return { allowed: false, reason: 'League membership not found.' };
  if (!active)
    return {
      allowed: false,
      reason: 'Your membership is inactive. Upgrade to continue.',
    };
  return { allowed: true };
}

export async function canSubmitPrediction(
  userId: string,
  leagueId: string,
): Promise<GuardResult> {
  const active = await getMemberActive(userId, leagueId);
  if (active === null)
    return { allowed: false, reason: 'League membership not found.' };
  if (!active)
    return {
      allowed: false,
      reason: 'Your membership is inactive. Upgrade to continue.',
    };
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
