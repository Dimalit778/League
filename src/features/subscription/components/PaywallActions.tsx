import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { RotateCcw } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PaywallActionsProps = {
  price: string;
  canPurchase: boolean;
  isLoadingOffer: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  onPurchase: () => void;
  onRestore: () => void;
};

export function PaywallActions({
  price,
  canPurchase,
  isLoadingOffer,
  isPurchasing,
  isRestoring,
  onPurchase,
  onRestore,
}: PaywallActionsProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const busy = isPurchasing || isRestoring;

  return (
    <View
      className="border-t border-white/10 bg-[#030B15] px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Upgrade for {{price}}', { price })}
        accessibilityState={{ disabled: !canPurchase || isLoadingOffer || isRestoring, busy: isPurchasing }}
        disabled={!canPurchase || isLoadingOffer || isRestoring || isPurchasing}
        className="mt-3 overflow-hidden rounded-2xl active:opacity-85 disabled:opacity-50"
        onPress={onPurchase}
      >
        <View className="rounded-2xl border border-primary px-4 py-3">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-center text-sm font-bold text-primary">{t('Champo Pro Season Pass')}</Text>
            <Text testID="paywall-price" ltr className="text-xl font-black text-primary">
              {price}
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

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        className="mt-2 flex-row items-center justify-center gap-1.5 py-1.5"
        onPress={onRestore}
      >
        <RotateCcw size={14} color="#CBD5E1" />
        <Text className="text-xs font-semibold text-neutral-400">{t('Restore Purchases')}</Text>
      </Pressable>
    </View>
  );
}
