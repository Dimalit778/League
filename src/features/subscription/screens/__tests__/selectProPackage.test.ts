import type { PurchasesPackage } from 'react-native-purchases';

import { selectProPackage } from '../selectProPackage';

const packageWithId = (identifier: string) => ({ identifier }) as PurchasesPackage;

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
