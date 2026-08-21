import type { PurchasesPackage } from 'react-native-purchases';

import { isSeasonActive, selectProPackage } from '../selectProPackage';

const packageWithId = (identifier: string) => ({ identifier }) as PurchasesPackage;

const SEASON = { startsAt: '2026-08-01T00:00:00Z', endsAt: '2027-08-01T00:00:00Z' };

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

describe('isSeasonActive', () => {
  it('is true inside the season window', () => {
    expect(isSeasonActive(new Date('2026-08-17T00:00:00Z'), SEASON)).toBe(true);
    expect(isSeasonActive(new Date('2027-01-05T00:00:00Z'), SEASON)).toBe(true);
  });

  it('is true exactly at starts_at', () => {
    expect(isSeasonActive(new Date('2026-08-01T00:00:00Z'), SEASON)).toBe(true);
  });

  it('is false before the season starts', () => {
    expect(isSeasonActive(new Date('2026-07-31T23:59:59Z'), SEASON)).toBe(false);
  });

  it('is false at/after the season end (ends_at is exclusive)', () => {
    expect(isSeasonActive(new Date('2027-08-01T00:00:00Z'), SEASON)).toBe(false);
  });
});
