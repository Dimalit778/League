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
