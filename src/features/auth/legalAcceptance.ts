import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useLanguageStore } from '@/store/LanguageStore';

export const CURRENT_TERMS_VERSION = '2026-08-04';
export const CURRENT_PRIVACY_VERSION = '2026-08-26.2';

export type LegalAcceptanceSource = 'email' | 'google' | 'apple';
export type LegalAuthFlow = 'sign_up' | 'social_continue';

export type LegalAcceptanceContext = {
  accepted: true;
  termsVersion: typeof CURRENT_TERMS_VERSION;
  privacyVersion: typeof CURRENT_PRIVACY_VERSION;
  source: LegalAcceptanceSource;
  authFlow: LegalAuthFlow;
  locale: 'en' | 'he';
  appVersion: string;
};

const PENDING_WEB_ACCEPTANCE_KEY = 'champo.pending-legal-acceptance';
const PENDING_WEB_ACCEPTANCE_MAX_AGE_MS = 15 * 60 * 1000;

export function createLegalAcceptanceContext(
  source: LegalAcceptanceSource,
  authFlow: LegalAuthFlow,
): LegalAcceptanceContext {
  return {
    accepted: true,
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION,
    source,
    authFlow,
    locale: useLanguageStore.getState().language,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
  };
}

export async function recordSocialLegalAcceptance(context: LegalAcceptanceContext): Promise<void> {
  if (context.source !== 'google' && context.source !== 'apple') {
    throw new Error('Invalid social legal acceptance source');
  }

  const { error } = await supabase.rpc('record_current_legal_acceptance', {
    p_source: context.source,
    p_auth_flow: context.authFlow,
    p_locale: context.locale,
    p_app_version: context.appVersion,
  });

  if (error) throw error;
}

export function savePendingWebLegalAcceptance(context: LegalAcceptanceContext): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.localStorage.setItem(
    PENDING_WEB_ACCEPTANCE_KEY,
    JSON.stringify({ context, createdAt: Date.now() }),
  );
}

export function clearPendingWebLegalAcceptance(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_WEB_ACCEPTANCE_KEY);
}

export async function recordPendingWebLegalAcceptance(authProvider?: string): Promise<void> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const raw = window.localStorage.getItem(PENDING_WEB_ACCEPTANCE_KEY);
  if (!raw) return;

  let pending: { context: LegalAcceptanceContext; createdAt: number };
  try {
    pending = JSON.parse(raw) as typeof pending;
  } catch {
    clearPendingWebLegalAcceptance();
    return;
  }

  const age = Date.now() - pending.createdAt;
  const hasCurrentDocuments =
    pending.context?.accepted === true &&
    pending.context.termsVersion === CURRENT_TERMS_VERSION &&
    pending.context.privacyVersion === CURRENT_PRIVACY_VERSION;
  const providerMatches = authProvider === pending.context?.source;

  if (
    !pending.createdAt ||
    age < 0 ||
    age > PENDING_WEB_ACCEPTANCE_MAX_AGE_MS ||
    !hasCurrentDocuments ||
    !providerMatches
  ) {
    clearPendingWebLegalAcceptance();
    return;
  }

  await recordSocialLegalAcceptance(pending.context);
  clearPendingWebLegalAcceptance();
}
