import type { PurchasesPackage } from 'react-native-purchases';

import {
  PRO_MONTH_PRODUCT_PREFIX,
  resolveSeasonMonth,
  selectMonthlyProPackage,
  selectProPackage,
} from '../selectProPackage';

const packageWithId = (identifier: string) => ({ identifier }) as PurchasesPackage;

const monthPackage = (mm: string) =>
  ({ identifier: `pkg_${mm}`, product: { identifier: `${PRO_MONTH_PRODUCT_PREFIX}${mm}` } }) as any;

const SEASON = { startsAt: '2026-07-01T00:00:00Z', endsAt: '2027-07-01T00:00:00Z' };

describe('selectProPackage', () => {
  const season = packageWithId('season-pass');
  const annual = packageWithId('annual');

  it('selects the only package when no package id is configured', () => {
    expect(selectProPackage([season])).toBe(season);
  });

  it('does not guess when an offering contains multiple packages', () => {
    expect(selectProPackage([season, annual])).toBeNull();
  });

  it('selects the configured package from a multi-package offering', () => {
    expect(selectProPackage([season, annual], 'season-pass')).toBe(season);
  });

  it('fails closed when the configured package is missing', () => {
    expect(selectProPackage([annual], 'season-pass')).toBeNull();
  });
});

describe('resolveSeasonMonth', () => {
  it('returns the calendar month inside the season window', () => {
    expect(resolveSeasonMonth(new Date('2026-08-17T00:00:00Z'), SEASON)).toBe(8);
    expect(resolveSeasonMonth(new Date('2027-01-05T00:00:00Z'), SEASON)).toBe(1);
  });

  it('returns the start month exactly at starts_at', () => {
    expect(resolveSeasonMonth(new Date('2026-07-01T00:00:00Z'), SEASON)).toBe(7);
  });

  it('returns null before the season starts', () => {
    expect(resolveSeasonMonth(new Date('2026-06-30T23:59:59Z'), SEASON)).toBeNull();
  });

  it('returns null at/after the season end (ends_at is exclusive)', () => {
    expect(resolveSeasonMonth(new Date('2027-07-01T00:00:00Z'), SEASON)).toBeNull();
  });
});

describe('selectMonthlyProPackage', () => {
  const july = monthPackage('07');
  const august = monthPackage('08');
  const january = monthPackage('01');

  it('selects the exact month tier', () => {
    expect(selectMonthlyProPackage([july, august, january], 8, 7)).toBe(august);
  });

  it('falls back to the nearest not-cheaper tier when the exact month is missing', () => {
    // September (elapsed 2) missing -> use August (elapsed 1), not January (elapsed 6).
    expect(selectMonthlyProPackage([july, august, january], 9, 7)).toBe(august);
  });

  it('returns null when no tier at or before the month is available', () => {
    // Only January (elapsed 6) available, current month August (elapsed 1).
    expect(selectMonthlyProPackage([january], 8, 7)).toBeNull();
  });

  it('returns null for an empty offering', () => {
    expect(selectMonthlyProPackage([], 8, 7)).toBeNull();
  });
});
