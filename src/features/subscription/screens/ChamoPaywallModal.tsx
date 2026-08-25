import { Text } from '@/components';
import { PaywallActions } from '@/features/subscription/components/PaywallActions';
import { PaywallError } from '@/features/subscription/components/PaywallError';
import { Plans } from '@/features/subscription/components/Plans';
import { useCurrentSeason } from '@/features/subscription/hooks/useCurrentSeason';
import { useTranslation } from '@/hooks/useTranslation';
import { useRestorePurchases } from '@/lib/revenuecat/purchases';
import type { PaywallResult } from '@/providers/PaywallProvider';
import { formatErrorForUser } from '@/utils/errorFormats';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Purchases, {
  PRODUCT_TYPE,
  PURCHASES_ERROR_CODE,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import { isSeasonActive, selectProPackage } from '../utils/selectProPackage';

type ChampoPaywallModalProps = {
  onComplete: (result: PaywallResult) => void;
};

const FALLBACK_PRICE = '$29.99';

const isPurchaseCancelled = (error: unknown): boolean => {
  const purchaseError = error as Partial<PurchasesError> | null;
  return purchaseError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || purchaseError?.userCancelled === true;
};

const ChampoPaywallModal = ({ onComplete }: ChampoPaywallModalProps) => {
  const { t } = useTranslation();
  const [purchasePackage, setPurchasePackage] = useState<PurchasesPackage | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const restorePurchases = useRestorePurchases();

  const { season, isLoading: isLoadingSeason } = useCurrentSeason();
  const seasonActive = season ? isSeasonActive(new Date(), season) : false;

  const loadOffering = useCallback(async () => {
    if (Platform.OS === 'web') return;

    if (!seasonActive) {
      setPurchasePackage(null);
      return;
    }

    setIsLoadingOffer(true);
    setErrorMessage(null);

    try {
      const offerings = await Purchases.getOfferings();

      const selectedPackage = selectProPackage(offerings.current?.availablePackages ?? []);

      if (!selectedPackage) {
        throw new Error(t('The Champo Pro offer is not available right now.'));
      }

      if (selectedPackage.product.productType === PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION) {
        throw new Error(t('The Champo Pro offer is incorrectly configured to renew automatically.'));
      }

      setPurchasePackage(selectedPackage);
    } catch (error) {
      setPurchasePackage(null);
      setErrorMessage(formatErrorForUser(error) || t('Unable to load the offer. Please try again.'));
    } finally {
      setIsLoadingOffer(false);
    }
  }, [t, seasonActive]);

  useEffect(() => {
    void loadOffering();
  }, [loadOffering]);

  const handlePurchase = useCallback(async () => {
    if (!purchasePackage) return;

    setIsPurchasing(true);
    setErrorMessage(null);

    try {
      await Purchases.purchasePackage(purchasePackage);
      onComplete('purchased');
    } catch (error) {
      if (!isPurchaseCancelled(error)) {
        setErrorMessage(formatErrorForUser(error) || t('Purchase failed. Please try again.'));
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [onComplete, purchasePackage, t]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    setErrorMessage(null);

    try {
      const restored = await restorePurchases();
      if (restored) {
        onComplete('restored');
        return;
      }

      setErrorMessage(t('No purchases found to restore'));
    } catch (error) {
      setErrorMessage(formatErrorForUser(error) || t('Failed to restore purchases'));
    } finally {
      setIsRestoring(false);
    }
  }, [onComplete, restorePurchases, t]);

  const busy = isPurchasing || isRestoring;

  return (
    <LinearGradient
      testID="paywall-screen"
      colors={['#061321', '#071525', '#030B15']}
      style={{ flex: 1, overflow: 'hidden' }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Close')}
        className="absolute left-3 top-3 z-20 h-11 w-11 items-center justify-center rounded-full bg-black/40"
        disabled={busy}
        onPress={() => {
          if (!busy) onComplete(false);
        }}
      >
        <X size={22} color="#FFFFFF" />
      </Pressable>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 18, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 pt-12">
          <Text variant="display" tone="primary" className="text-center">
            {t('Get full access')}
          </Text>
          <Text variant="body" tone="secondary" className="text-center">
            {t('Join more leagues, play every competition and unlock complete AI analysis.')}
          </Text>
        </View>
        <Plans />
        {errorMessage ? (
          <PaywallError message={errorMessage} onRetry={purchasePackage ? undefined : loadOffering} />
        ) : null}
      </ScrollView>

      {!isLoadingSeason && !seasonActive ? (
        <View className="border-t border-white/10 bg-[#030B15] px-4 py-4">
          <Text className="text-center text-sm text-slate-300">{t('No active season right now')}</Text>
        </View>
      ) : (
        <PaywallActions
          price={purchasePackage?.product.priceString ?? FALLBACK_PRICE}
          status={
            isPurchasing
              ? 'purchasing'
              : isRestoring
                ? 'restoring'
                : isLoadingOffer
                  ? 'loadingOffer'
                  : seasonActive && purchasePackage
                    ? 'ready'
                    : 'unavailable'
          }
          onPurchase={handlePurchase}
          onRestore={handleRestore}
        />
      )}
    </LinearGradient>
  );
};

export default ChampoPaywallModal;
