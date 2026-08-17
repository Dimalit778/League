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

export const PRO_MONTH_PRODUCT_PREFIX = 'champo_pro_m';

const monthNumberFromDate = (date: Date): number => date.getUTCMonth() + 1;

/** Calendar month (1..12) when `now` is inside [startsAt, endsAt); else null. */
export function resolveSeasonMonth(
  now: Date,
  season: { startsAt: string; endsAt: string },
): number | null {
  const start = new Date(season.startsAt).getTime();
  const end = new Date(season.endsAt).getTime();
  const t = now.getTime();

  if (t < start || t >= end) {
    return null;
  }
  return monthNumberFromDate(now);
}

/** Months elapsed since the season start month (season start = 0 … 11). */
const elapsedIndex = (monthNumber: number, seasonStartMonth: number): number =>
  ((monthNumber - seasonStartMonth) + 12) % 12;

const productMonth = (pkg: PurchasesPackage): number | null => {
  const id = pkg.product.identifier;
  if (!id.startsWith(PRO_MONTH_PRODUCT_PREFIX)) return null;
  const mm = Number(id.slice(PRO_MONTH_PRODUCT_PREFIX.length));
  return Number.isInteger(mm) && mm >= 1 && mm <= 12 ? mm : null;
};

/**
 * Pick the tier for `monthNumber`; if that exact product is absent, fall back to
 * the nearest available tier that is NOT cheaper (elapsed index closest to, but
 * not beyond, the current month). Returns null when no eligible tier exists.
 */
export function selectMonthlyProPackage(
  packages: readonly PurchasesPackage[],
  monthNumber: number,
  seasonStartMonth: number,
): PurchasesPackage | null {
  const currentElapsed = elapsedIndex(monthNumber, seasonStartMonth);

  let best: PurchasesPackage | null = null;
  let bestElapsed = -1;

  for (const pkg of packages) {
    const mm = productMonth(pkg);
    if (mm === null) continue;

    const e = elapsedIndex(mm, seasonStartMonth);
    if (e > currentElapsed) continue; // cheaper/later tier — never undercharge.
    if (e > bestElapsed) {
      best = pkg;
      bestElapsed = e;
    }
  }

  return best;
}
