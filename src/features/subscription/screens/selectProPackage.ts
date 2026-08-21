import type { PurchasesPackage } from 'react-native-purchases';

export function selectProPackage(
  packages: readonly PurchasesPackage[],
  configuredPackageId?: string,
): PurchasesPackage | null {
  if (configuredPackageId) {
    return packages.find((item) => item.identifier === configuredPackageId) ?? null;
  }

  // Without an explicit id, selecting is safe only when the offering has one product.
  return packages.length === 1 ? packages[0] : null;
}

/** True when `now` falls inside the season window [startsAt, endsAt). */
export function isSeasonActive(
  now: Date,
  season: { startsAt: string; endsAt: string },
): boolean {
  const start = new Date(season.startsAt).getTime();
  const end = new Date(season.endsAt).getTime();
  const t = now.getTime();
  return t >= start && t < end;
}
