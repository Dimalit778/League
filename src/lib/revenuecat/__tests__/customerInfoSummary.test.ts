import type { CustomerInfo } from 'react-native-purchases';
import { getSubscriptionSummary, hasActiveEntitlement } from '../customerInfoSummary';

const buildCustomerInfo = (overrides: Partial<CustomerInfo> = {}): CustomerInfo =>
  ({
    originalAppUserId: 'user-123',
    entitlements: {
      active: {},
      all: {},
    },
    ...overrides,
  }) as CustomerInfo;

describe('getSubscriptionSummary', () => {
  it('returns inactive summary when customer info is null', () => {
    expect(getSubscriptionSummary(null)).toEqual({
      isActive: false,
      expiresAt: null,
      productId: null,
      willRenew: null,
      isAnonymous: true,
    });
  });

  it('returns active summary from active entitlement', () => {
    const info = buildCustomerInfo({
      entitlements: {
        active: {
          pro: {
            expirationDate: '2026-06-01T00:00:00.000Z',
            productIdentifier: 'pro_monthly',
            willRenew: true,
          },
        },
        all: {},
      },
    } as Partial<CustomerInfo>);

    expect(getSubscriptionSummary(info)).toEqual({
      isActive: true,
      expiresAt: '2026-06-01T00:00:00.000Z',
      productId: 'pro_monthly',
      willRenew: true,
      isAnonymous: false,
    });
  });

  it('falls back to all entitlement when inactive', () => {
    const info = buildCustomerInfo({
      entitlements: {
        active: {},
        all: {
          pro: {
            expirationDate: '2026-05-27T23:01:35.000Z',
            productIdentifier: 'pro_yearly',
            willRenew: true,
          },
        },
      },
    } as Partial<CustomerInfo>);

    expect(getSubscriptionSummary(info)).toEqual({
      isActive: false,
      expiresAt: '2026-05-27T23:01:35.000Z',
      productId: 'pro_yearly',
      willRenew: true,
      isAnonymous: false,
    });
  });
});

describe('hasActiveEntitlement', () => {
  it('returns false for null customer info', () => {
    expect(hasActiveEntitlement(null)).toBe(false);
    expect(hasActiveEntitlement(null, 'pro')).toBe(false);
  });

  it('returns true when any active entitlement exists', () => {
    const info = buildCustomerInfo({
      entitlements: {
        active: { pro: {} },
        all: {},
      },
    } as Partial<CustomerInfo>);

    expect(hasActiveEntitlement(info)).toBe(true);
    expect(hasActiveEntitlement(info, 'pro')).toBe(true);
  });
});
