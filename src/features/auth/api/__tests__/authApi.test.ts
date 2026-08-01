import { parseRecoveryTokensFromUrl } from '../authApi';

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
