import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { purchasesService } from '../../../lib/revenuecat/purchases';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionType } from '../types';
import plans from '../utils/plans';

const getVisiblePlanType = (type: SubscriptionType): SubscriptionType => {
  if (type === 'BASIC' || type === 'PREMIUM') return 'BASIC';
  return 'FREE';
};

const getManageSubscriptionUrl = () => {
  if (Platform.OS === 'ios') {
    return 'https://apps.apple.com/account/subscriptions';
  }

  return 'https://play.google.com/store/account/subscriptions';
};

const SubscriptionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const queryClient = useQueryClient();
  const edges = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.user?.id ?? null);

  const { data: currentSubscription, isLoading: isLoadingSubscription } = useSubscription();

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';
  const visibleSubscriptionType = getVisiblePlanType(subscriptionType);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    setSelectedPlan(visibleSubscriptionType);
  }, [visibleSubscriptionType]);

  const isPro = visibleSubscriptionType === 'BASIC';
  const isLoading = isLoadingSubscription || isPurchasing || isRestoring;

  const invalidateSubscription = async () => {
    if (!userId) return;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: KEYS.subscriptions.detail(userId),
      }),
      queryClient.invalidateQueries({
        queryKey: KEYS.subscriptions.canCreateLeague(userId),
      }),
    ]);
  };

  const handleSubscribePress = async () => {
    setIsPurchasing(true);

    try {
      const success = await purchasesService.presentPaywall();

      if (success) {
        await invalidateSubscription();

        Alert.alert(t('Success'), t('Your subscription is now active!'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('Something went wrong');

      Alert.alert(t('Purchase failed'), message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePress = async () => {
    setIsRestoring(true);

    try {
      const active = await purchasesService.restorePurchases();

      if (active) {
        await invalidateSubscription();

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

  const handleManageSubscription = async () => {
    const url = getManageSubscriptionUrl();
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert(t('Error'), t('Could not open subscription settings'));
      return;
    }

    await Linking.openURL(url);
  };

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
            isActive={visibleSubscriptionType === p.type}
            onSelect={() => setSelectedPlan(p.type)}
          />
        ))}

        {!isPro && (
          <Pressable
            onPress={handleSubscribePress}
            disabled={isPurchasing}
            style={{
              backgroundColor: isPurchasing ? colors.muted : colors.primary,
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 8,
              opacity: isPurchasing ? 0.7 : 1,
            }}
          >
            <CText variant="bodyBold" className="text-background">
              {isPurchasing ? t('Loading...') : t('Upgrade to Pro')}
            </CText>
          </Pressable>
        )}

        {isPro ? (
          <Pressable
            onPress={handleManageSubscription}
            style={{
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            <CText variant="caption" className="text-muted">
              {t('Manage subscription')}
            </CText>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleRestorePress}
            disabled={isRestoring}
            style={{
              alignItems: 'center',
              marginTop: 20,
              opacity: isRestoring ? 0.7 : 1,
            }}
          >
            <CText variant="caption" className="text-muted">
              {isRestoring ? t('Restoring...') : t('Restore purchases')}
            </CText>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
};

export default SubscriptionScreen;
