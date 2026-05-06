import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import { useCreateStripeSubscription, useSubscription } from '../hooks/useSubscription';
import { SubscriptionType } from '../types';
import plans from '../utils/plans';

// StripePaymentForm is web-only — lazy import to avoid bundling Stripe on native
let StripePaymentForm: React.ComponentType<{
  clientSecret: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}> | null = null;

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  StripePaymentForm = require('../components/payment/StripePaymentForm').default;
}

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
  const { data: currentSubscription, isLoading: isLoadingSubscription, refetch } = useSubscription();
  const { mutate: createStripeSubscription, isPending: isCreatingSetup } = useCreateStripeSubscription();

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';
  const visibleSubscriptionType = getVisiblePlanType(subscriptionType);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const edges = useSafeAreaInsets();

  useEffect(() => {
    setSelectedPlan(visibleSubscriptionType);
  }, [visibleSubscriptionType]);

  const canProceed = selectedPlan !== null && selectedPlan !== visibleSubscriptionType;

  const handleSubscribePress = () => {
    if (!canProceed) return;

    if (Platform.OS === 'web') {
      // Step 2 on web: create Stripe subscription and show payment form
      createStripeSubscription(undefined, {
        onSuccess: (data) => setClientSecret(data.clientSecret),
        onError: (err) => Alert.alert(t('Error'), err.message || t('Failed to start payment')),
      });
    } else {
      // Native placeholder — RevenueCat coming later
      Alert.alert(
        t('Coming soon'),
        t('In-app purchases are available on the website. Visit our web app to subscribe.')
      );
    }
  };

  const handlePaymentSuccess = async () => {
    setClientSecret(null);
    await refetch();
    router.replace('/(app)/(member)/(tabs)/League');
  };

  const handlePaymentError = (msg: string) => {
    Alert.alert(t('Payment failed'), msg);
  };

  const isLoading = isLoadingSubscription || isCreatingSetup;

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
            onSelect={() => {
              setSelectedPlan(p.type);
              setClientSecret(null); // reset payment form if plan changes
            }}
          />
        ))}

        {/* Subscribe button — shown when a different plan is selected */}
        {canProceed && !clientSecret && (
          <Pressable
            onPress={handleSubscribePress}
            disabled={isCreatingSetup}
            style={{
              backgroundColor: isCreatingSetup ? colors.muted : colors.primary,
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <CText variant="bodyBold" className="text-background">
              {isCreatingSetup ? t('Loading...') : `${t('Subscribe to')} ${t(getPlanLabel(selectedPlan!))} — $3.99/${t('mo')}`}
            </CText>
          </Pressable>
        )}

        {/* Stripe Elements — web only, shown after clientSecret is ready */}
        {clientSecret && StripePaymentForm && (
          <Card className="p-4 mt-4">
            <CText variant="bodyBold" className="mb-4">
              {t('Enter payment details')}
            </CText>
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            <Pressable
              onPress={() => setClientSecret(null)}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <CText variant="caption" className="text-muted">
                {t('Cancel')}
              </CText>
            </Pressable>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
};

export default SubscriptionScreen;
