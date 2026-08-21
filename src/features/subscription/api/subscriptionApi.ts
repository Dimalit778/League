import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';

export type SyncSubscriptionResult = {
  plan: 'pro' | 'free';
  status: string;
  expires_at: string | null;
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
