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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Syncs the subscription to the server and retries until the server confirms
 * `plan === 'pro'` (RevenueCat propagation can lag right after a purchase).
 * Each attempt is best-effort — a thrown error is retried, not surfaced — so a
 * transient failure does not lose a completed purchase. Returns the last known
 * server result (or null if every attempt failed).
 */
export const syncSubscriptionToServerUntilPro = async ({
  attempts = 3,
  delayMs = 1500,
}: { attempts?: number; delayMs?: number } = {}): Promise<SyncSubscriptionResult | null> => {
  let last: SyncSubscriptionResult | null = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      last = await syncSubscriptionToServer();
      if (last?.plan === 'pro') return last;
    } catch (error) {
      console.warn(`[subscription] server sync attempt ${attempt + 1}/${attempts} failed:`, error);
    }

    if (attempt < attempts - 1) await wait(delayMs);
  }

  return last;
};
