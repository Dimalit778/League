import { images } from '@/assets/images';
import { Text } from '@/components';
import { useCurrentSeason } from '@/features/subscription/hooks/useCurrentSeason';
import { useTranslation } from '@/hooks/useTranslation';
import { hasActiveEntitlement, PRO_ENTITLEMENT } from '@/lib/revenuecat/customerInfoSummary';
import { formatErrorForUser } from '@/utils/errorFormats';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Purchases, {
  PRODUCT_TYPE,
  PURCHASES_ERROR_CODE,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isSeasonActive, selectProPackage } from './selectProPackage';
type ChampoPaywallModalProps = {
  onComplete: (purchased: boolean) => void;
};

type ComparisonRowProps = {
  label: string;
  freeValue: string;
  proValue: string;
  isRTL: boolean;
  last?: boolean;
};

const FALLBACK_PRICE = '$29.99';

const isPurchaseCancelled = (error: unknown): boolean => {
  const purchaseError = error as Partial<PurchasesError> | null;
  return purchaseError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || purchaseError?.userCancelled === true;
};

function ComparisonRow({ label, freeValue, proValue, isRTL, last = false }: ComparisonRowProps) {
  const labelCell = (
    <View key="label" style={styles.comparisonLabelCell}>
      <Text className="text-sm font-semibold leading-5 text-slate-200">{label}</Text>
    </View>
  );
  const freeCell = (
    <View key="free" style={styles.comparisonValueCell}>
      <Text className="text-center text-sm font-bold text-white">{freeValue}</Text>
    </View>
  );
  const proCell = (
    <View key="pro" style={[styles.comparisonValueCell, styles.proCell, last && styles.proCellBottom]}>
      <Text className="text-center text-sm font-black text-[#FFE49A]">{proValue}</Text>
    </View>
  );

  return (
    <View style={[styles.comparisonRow, !last && styles.comparisonDivider]}>
      {isRTL ? [proCell, freeCell, labelCell] : [labelCell, freeCell, proCell]}
    </View>
  );
}

const ChampoPaywallModal = ({ onComplete }: ChampoPaywallModalProps) => {
  const { t, isRTL } = useTranslation();
  const insets = useSafeAreaInsets();
  const [purchasePackage, setPurchasePackage] = useState<PurchasesPackage | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const selectedPackage = selectProPackage(
        offerings.current?.availablePackages ?? [],
        process.env.EXPO_PUBLIC_REVENUECAT_PRO_PACKAGE_ID,
      );

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
      const { customerInfo } = await Purchases.purchasePackage(purchasePackage);

      if (!hasActiveEntitlement(customerInfo, PRO_ENTITLEMENT)) {
        throw new Error(t('The purchase completed, but Pro access is still being confirmed.'));
      }

      onComplete(true);
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
      const customerInfo = await Purchases.restorePurchases();
      if (hasActiveEntitlement(customerInfo, PRO_ENTITLEMENT)) {
        onComplete(true);
        return;
      }

      setErrorMessage(t('No purchases found to restore'));
    } catch (error) {
      setErrorMessage(formatErrorForUser(error) || t('Failed to restore purchases'));
    } finally {
      setIsRestoring(false);
    }
  }, [onComplete, t]);

  const busy = isPurchasing || isRestoring;
  const displayedPrice = purchasePackage?.product.priceString ?? FALLBACK_PRICE;
  const close = () => {
    if (!busy) onComplete(false);
  };

  return (
    <LinearGradient testID="paywall-screen" colors={['#061321', '#071525', '#030B15']} style={styles.screen}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Close')}
        className="absolute top-3 z-20 h-11 w-11 items-center justify-center rounded-full bg-black/40"
        style={styles.closeButton}
        disabled={busy}
        onPress={close}
      >
        <X size={22} color="#FFFFFF" />
      </Pressable>

      <ScrollView className="flex-1" contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-1">
          <Text className="text-center text-3xl font-black leading-9 text-[#FFE08A]">{t('Get full access')}</Text>
          <Text className="mx-3 mt-2 text-center text-sm leading-5 text-slate-300">
            {t('Join more leagues, play every competition and unlock complete AI analysis.')}
          </Text>
        </View>

        <View className="mx-4 mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <Image
            testID="comparison-background"
            source={images.seasonPass}
            contentFit="contain"
            accessible={false}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient colors={['rgba(3,11,21,0.9)', 'rgba(3,11,21,0.92)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.comparisonHeader, styles.comparisonDivider]}>
            {isRTL ? (
              <>
                <View style={[styles.comparisonValueCell, styles.proCell, styles.proCellTop]}>
                  <Text className="text-center text-sm font-black text-[#FFE49A]">{t('PRO')}</Text>
                </View>
                <View style={styles.comparisonValueCell}>
                  <Text className="text-center text-sm font-bold text-white">{t('FREE')}</Text>
                </View>
                <View style={styles.comparisonLabelCell}>
                  <Text className="text-sm font-bold text-white">{t("What's included")}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.comparisonLabelCell}>
                  <Text className="text-sm font-bold text-white">{t("What's included")}</Text>
                </View>
                <View style={styles.comparisonValueCell}>
                  <Text className="text-center text-sm font-bold text-white">{t('FREE')}</Text>
                </View>
                <View style={[styles.comparisonValueCell, styles.proCell, styles.proCellTop]}>
                  <Text className="text-center text-sm font-black text-[#FFE49A]">{t('PRO')}</Text>
                </View>
              </>
            )}
          </View>
          <ComparisonRow isRTL={isRTL} label={t('Football competitions')} freeValue="2" proValue="6" />
          <ComparisonRow isRTL={isRTL} label={t('Active friend leagues')} freeValue="2" proValue="5" />
          <ComparisonRow isRTL={isRTL} label={t('Members per league')} freeValue="6" proValue="12" />
          <ComparisonRow
            isRTL={isRTL}
            label={t('AI match insights')}
            freeValue={t('Score')}
            proValue={t('Full')}
            last
          />
        </View>

        {errorMessage ? (
          <View className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
            <Text testID="paywall-error" className="text-center text-sm text-red-200">
              {errorMessage}
            </Text>
            {!purchasePackage ? (
              <Pressable className="mt-2 self-center" onPress={loadOffering}>
                <Text className="font-bold text-[#F4C64E]">{t('Try again')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-white/10 bg-[#030B15] px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {!isLoadingSeason && !seasonActive ? (
          <View className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Text className="text-center text-sm text-slate-300">{t('No active season right now')}</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Upgrade for {{price}}', { price: displayedPrice })}
            accessibilityState={{
              disabled: !seasonActive || !purchasePackage || isLoadingOffer || isRestoring,
              busy: isPurchasing,
            }}
            disabled={!seasonActive || !purchasePackage || isLoadingOffer || isRestoring || isPurchasing}
            className="mt-3 overflow-hidden rounded-2xl active:opacity-85 disabled:opacity-50"
            onPress={handlePurchase}
          >
            <View className="rounded-2xl border border-primary px-4 py-3">
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-center text-sm font-bold text-primary">{t('Champo Pro Season Pass')}</Text>
                <Text testID="paywall-price" ltr className="text-xl font-black text-primary">
                  {displayedPrice}
                </Text>
              </View>
              <Text className="mt-1 text-center text-xs text-neutral-400">
                {t('One payment for the full season. No automatic renewal.')}
              </Text>
              {isLoadingOffer ? (
                <Text className="mt-1 text-center text-xs text-neutral-400">
                  {t('Confirming the local App Store price…')}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          className="mt-2 flex-row items-center justify-center gap-1.5 py-1.5"
          onPress={handleRestore}
        >
          <RotateCcw size={14} color="#CBD5E1" />
          <Text className="text-xs font-semibold text-neutral-400">{t('Restore Purchases')}</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

export default ChampoPaywallModal;

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  scrollContent: { paddingBottom: 18 },
  closeButton: { left: 12 },

  heroTrophy: { position: 'absolute', right: 18, bottom: 4, width: 170, height: 170 },
  comparisonHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'stretch' },
  comparisonRow: { minHeight: 55, flexDirection: 'row', alignItems: 'stretch' },
  comparisonDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)' },
  comparisonLabelCell: { flex: 1, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  comparisonValueCell: { width: 72, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 8 },
  proCell: { backgroundColor: '#173A60' },
  proCellTop: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  proCellBottom: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  purchaseButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
