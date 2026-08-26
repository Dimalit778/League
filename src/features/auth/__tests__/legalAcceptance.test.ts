import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import {
  createLegalAcceptanceContext,
  recordPendingWebLegalAcceptance,
  savePendingWebLegalAcceptance,
} from '@/features/auth/legalAcceptance';

describe('web legal acceptance evidence', () => {
  const originalOS = Platform.OS;
  let storage: Map<string, string>;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' });
    storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    jest.clearAllMocks();
  });

  it('records a current pending acceptance only for the returning OAuth provider', async () => {
    savePendingWebLegalAcceptance(createLegalAcceptanceContext('google', 'sign_up'));

    await recordPendingWebLegalAcceptance('google');

    expect(supabase.rpc).toHaveBeenCalledWith('record_current_legal_acceptance', {
      p_source: 'google',
      p_auth_flow: 'sign_up',
      p_locale: 'en',
      p_app_version: expect.any(String),
    });
    expect(storage.size).toBe(0);
  });

  it('discards the pending evidence when a different provider signs in', async () => {
    savePendingWebLegalAcceptance(createLegalAcceptanceContext('google', 'sign_up'));

    await recordPendingWebLegalAcceptance('email');

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(storage.size).toBe(0);
  });
});
