import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';
import { purchasesService } from '../services/purchases';
import { SubscriptionType } from '../types';
import plans from '../utils/plans';

const getVisiblePlanType = (type: SubscriptionType): SubscriptionType => {
  if (type === 'PREMIUM') return 'BASIC';
  return type;
};

const getPlanLabel = (type: SubscriptionType): string => {
  if (type === 'BASIC') return 'PRO';
  return type;
};

const SubscriptionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const edges = useSafeAreaInsets();

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';
  const visibleSubscriptionType = getVisiblePlanType(subscriptionType);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    setSelectedPlan(visibleSubscriptionType);
  }, [visibleSubscriptionType]);

  const canProceed = selectedPlan !== null && selectedPlan !== visibleSubscriptionType;

  // TODO: wire up purchasesService.configure() in AuthProvider on login
  const handleSubscribePress = async () => {
    if (!canProceed) return;
    setIsPurchasing(true);
    try {
      // TODO: replace stub with real RevenueCat purchase
      const success = await purchasesService.purchaseMonthly();
      if (success) {
        // TODO: invalidate React Query subscriptions cache after successful purchase
        // queryClient.invalidateQueries({ queryKey: KEYS.subscriptions.detail(userId) });
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
      // TODO: replace stub with real RevenueCat restore
      const active = await purchasesService.restorePurchases();
      if (active) {
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

  const isLoading = isLoadingSubscription || isPurchasing || isRestoring;

  return (
    <Screen withSafeArea>
      <BackButton title={t('Subscription')} />

      {isLoading && <LoadingOverlay />}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: edges.bottom + 24, paddingHorizontal: 12 }}
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
                : `${t('Subscribe to')} ${t(getPlanLabel(selectedPlan!))} — $3.99/${t('mo')}`}
            </CText>
          </Pressable>
        )}

        <Pressable
          onPress={handleRestorePress}
          disabled={isRestoring}
          style={{ alignItems: 'center', marginTop: 20 }}
        >
          <CText variant="caption" className="text-muted">
            {isRestoring ? t('Restoring...') : t('Restore purchases')}
          </CText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
};

export default SubscriptionScreen;
