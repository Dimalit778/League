import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';

export type SyncSubscriptionResult = {
  plan: 'pro' | 'free';
  status: string;
  expires_at: string | null;
};

export type SubscriptionAccess = {
  planCode: 'free' | 'pro';
  isDefault: boolean;
  status: string;
  expiresAt: string | null;
  limits: {
    maxActiveLeagues: number;
    maxMembersPerLeague: number;
    weeklyAiAnalyses: number | null;
  };
  capabilities: {
    premiumCompetitions: boolean;
    advancedStats: boolean;
  };
};

export type SubscriptionPlan = {
  code: 'free' | 'pro';
  rank: number;
  isDefault: boolean;
  nameEn: string;
  nameHe: string;
  descriptionEn: string | null;
  descriptionHe: string | null;
  limits: {
    maxActiveLeagues: number;
    maxMembersPerLeague: number;
    weeklyAiAnalyses: number | null;
  };
  capabilities: {
    premiumCompetitions: boolean;
    advancedStats: boolean;
  };
  sortOrder: number;
};

type SubscriptionAccessRow = {
  plan_code?: unknown;
  is_default?: unknown;
  status?: unknown;
  expires_at?: unknown;
  limits?: {
    max_active_leagues?: unknown;
    max_members_per_league?: unknown;
    weekly_ai_analyses?: unknown;
  };
  capabilities?: {
    premium_competitions?: unknown;
    advanced_stats?: unknown;
  };
};

const toNumber = (value: unknown): number => (typeof value === 'number' ? value : 0);
const toNullableNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(
      'code, rank, is_default, name_en, name_he, description_en, description_he, max_active_leagues, max_members_per_league, can_use_premium_competitions, weekly_ai_analyses, has_advanced_stats, sort_order',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(formatErrorForUser(error));
  }

  return (data ?? []).flatMap((row) => {
    if (row.code !== 'free' && row.code !== 'pro') return [];

    return [{
      code: row.code,
      rank: row.rank,
      isDefault: row.is_default,
      nameEn: row.name_en,
      nameHe: row.name_he,
      descriptionEn: row.description_en,
      descriptionHe: row.description_he,
      limits: {
        maxActiveLeagues: row.max_active_leagues,
        maxMembersPerLeague: row.max_members_per_league,
        weeklyAiAnalyses: row.weekly_ai_analyses,
      },
      capabilities: {
        premiumCompetitions: row.can_use_premium_competitions,
        advancedStats: row.has_advanced_stats,
      },
      sortOrder: row.sort_order,
    }];
  });
};

export const getMySubscriptionAccess = async (): Promise<SubscriptionAccess> => {
  const { data, error } = await supabase.rpc('get_my_subscription_access');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }

  const row = data as SubscriptionAccessRow | null;
  const planCode = row?.plan_code === 'pro' ? 'pro' : 'free';

  return {
    planCode,
    isDefault: row?.is_default === true,
    status: typeof row?.status === 'string' ? row.status : 'inactive',
    expiresAt: typeof row?.expires_at === 'string' ? row.expires_at : null,
    limits: {
      maxActiveLeagues: toNumber(row?.limits?.max_active_leagues),
      maxMembersPerLeague: toNumber(row?.limits?.max_members_per_league),
      weeklyAiAnalyses: toNullableNumber(row?.limits?.weekly_ai_analyses),
    },
    capabilities: {
      premiumCompetitions: row?.capabilities?.premium_competitions === true,
      advancedStats: row?.capabilities?.advanced_stats === true,
    },
  };
};

export const syncSubscriptionToServer = async (): Promise<SyncSubscriptionResult | null> => {
  const { data, error } = await supabase.functions.invoke<SyncSubscriptionResult>('sync-subscription');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }

  return data ?? null;
};

/**
 * Kept as the public post-purchase helper. RevenueCat propagation retries run
 * inside the Edge Function so one user action consumes one rate-limit slot.
 */
export const syncSubscriptionToServerUntilPro = (): Promise<SyncSubscriptionResult | null> =>
  syncSubscriptionToServer();

export type ProSeason = {
  code: string;
  startsAt: string;
  endsAt: string;
};

export const getCurrentSeason = async (): Promise<ProSeason | null> => {
  const { data, error } = await supabase.rpc('get_current_season');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return null;
  }

  return { code: row.code, startsAt: row.starts_at, endsAt: row.ends_at };
};
