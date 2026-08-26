import { supabase } from '@/lib/supabase';
import { parseRecoveryTokensFromUrl, signUp } from '../authApi';

const acceptance = {
  accepted: true,
  termsVersion: '2026-08-04',
  privacyVersion: '2026-08-26.2',
  source: 'email',
  authFlow: 'sign_up',
  locale: 'he',
  appVersion: '1.0.0',
} as const;

describe('signUp legal acceptance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the accepted document versions for server-side audit capture', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { identities: [{ id: 'identity' }] } },
      error: null,
    });

    const result = await signUp('test@example.com', 'password123', 'Test User', acceptance);

    expect(result).toEqual({ success: true });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          provider: 'email',
          legal_accepted: true,
          legal_terms_version: '2026-08-04',
          legal_privacy_version: '2026-08-26.2',
          legal_locale: 'he',
          legal_app_version: '1.0.0',
        },
      },
    });
  });

  it('refuses signup with mismatched legal versions', async () => {
    const result = await signUp('test@example.com', 'password123', 'Test User', {
      ...acceptance,
      termsVersion: '2025-01-01' as '2026-08-04',
    });

    expect(result.success).toBe(false);
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });
});

describe('parseRecoveryTokensFromUrl', () => {
  it('accepts a complete password recovery link', () => {
    const result = parseRecoveryTokensFromUrl(
      'champo://resetPassword#access_token=access&refresh_token=refresh&type=recovery',
    );

    expect(result).toEqual({
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
      error: null,
    });
  });

  it('rejects a link with a non-recovery session type', () => {
    const result = parseRecoveryTokensFromUrl(
      'champo://resetPassword#access_token=access&refresh_token=refresh&type=signup',
    );

    expect(result.tokens).toBeNull();
    expect(result.error).toBe('Invalid password recovery link.');
  });

  it('rejects a recovery link with missing tokens', () => {
    const result = parseRecoveryTokensFromUrl('champo://resetPassword#type=recovery&access_token=access');

    expect(result.tokens).toBeNull();
    expect(result.error).toBe('Invalid password recovery link.');
  });

  it('surfaces an expired-link error returned by Supabase', () => {
    const result = parseRecoveryTokensFromUrl(
      'champo://resetPassword#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
    );

    expect(result.tokens).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
