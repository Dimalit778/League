import { isRevenueCatNetworkError } from '../revenueCatNetworkError';

describe('isRevenueCatNetworkError', () => {
  it('detects RevenueCat network errors', () => {
    expect(
      isRevenueCatNetworkError({
        code: 'NetworkError',
        message: 'Error performing request.',
        underlyingErrorMessage: 'Unable to resolve host "api.revenuecat.com"',
      }),
    ).toBe(true);
  });

  it('detects generic fetch network failures', () => {
    expect(isRevenueCatNetworkError(new TypeError('Network request failed'))).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isRevenueCatNetworkError(new Error('Invalid API key'))).toBe(false);
  });
});
