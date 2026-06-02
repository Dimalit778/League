import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { purchasesService } from '@/lib/revenuecat/purchases';
import { RelativePathString, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import plans from '../config/plans';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionType } from '../types';

const SubscriptionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { data: currentSubscription } = useSubscription();
  const edges = useSafeAreaInsets();

  const subscriptionType: SubscriptionType = currentSubscription?.type ?? 'FREE';

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    setSelectedPlan(subscriptionType);
  }, [subscriptionType]);

  const isPaid = subscriptionType !== 'FREE';
  const canProceed = selectedPlan !== null && selectedPlan !== 'FREE' && selectedPlan !== subscriptionType;

  const handleSubscribePress = async () => {
    if (!canProceed) return;
    setIsPurchasing(true);
    try {
      const payload = await purchasesService.purchaseMonthly();
      if (payload) {
        Alert.alert(t('Success'), t('Your subscription is now active!'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('Something went wrong');
      Alert.alert(t('Purchase failed'), message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleRestorePress = async () => {
    setIsRestoring(true);
    try {
      const payload = await purchasesService.restorePurchases();
      if (payload) {
        Alert.alert(t('Restored'), t('Your subscription has been restored.'));
      } else {
        Alert.alert(t('Nothing to restore'), t('No active subscription found for this account.'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('Something went wrong');
      Alert.alert(t('Restore failed'), message);
    } finally {
      setIsRestoring(false);
    }
  };

  const isLoading = isPurchasing || isRestoring;

  return (
    <Screen withSafeArea>
      <BackButton title={t('Subscription')} />

      {isLoading && <LoadingOverlay />}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: edges.bottom + 24,
          paddingHorizontal: 12,
        }}
      >
        <CText variant="h2" className="my-2">
          {t('Choose Your Plan')}
        </CText>
        <CText variant="caption" bold className="text-muted mb-6">
          {t('Upgrade your subscription to access more features and create larger leagues')}
        </CText>

        {plans.map((p) => (
          <SubscriptionCard
            key={p.type}
            type={p.type}
            price={p.price}
            features={p.features}
            isActive={subscriptionType === p.type}
            onSelect={() => setSelectedPlan(p.type)}
          />
        ))}

        {canProceed && (
          <Pressable
            onPress={handleSubscribePress}
            disabled={isPurchasing}
            style={{
              backgroundColor: isPurchasing ? colors.muted : colors.primary,
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <CText variant="bodyBold" className="text-background">
              {isPurchasing
                ? t('Loading...')
                : `${t('Subscribe to')} ${t(selectedPlan!)} — ${plans.find((p) => p.type === selectedPlan)?.price}/${t('mo')}`}
            </CText>
          </Pressable>
        )}

        {isPaid ? (
          <Pressable onPress={handleManageSubscription} style={{ alignItems: 'center', marginTop: 20 }}>
            <CText variant="caption" className="text-muted">
              {t('Manage subscription')}
            </CText>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleRestorePress}
            disabled={isRestoring}
            style={{ alignItems: 'center', marginTop: 20 }}
          >
            <CText variant="caption" className="text-muted">
              {isRestoring ? t('Restoring...') : t('Restore purchases')}
            </CText>
          </Pressable>
        )}

        <View className="mt-6 flex-row flex-wrap justify-center">
          <Pressable onPress={() => router.push('/settings/privacy' as RelativePathString)}>
            <CText variant="caption" className="text-muted underline">
              {t('Privacy Policy')}
            </CText>
          </Pressable>
          <CText variant="caption" className="px-2 text-muted">
            |
          </CText>
          <Pressable onPress={() => router.push('/settings/terms' as RelativePathString)}>
            <CText variant="caption" className="text-muted underline">
              {t('Terms of Service')}
            </CText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default SubscriptionScreen;
