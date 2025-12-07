import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';

import { CText } from '@/components/ui/CText';
import SubscriptionCard from '@/features/subscription/components/subscription/SubscriptionCard';
import SubscriptionFeatures from '@/features/subscription/components/subscription/SubscriptionFeatures';
import { useCreateSubscription, useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubscriptionType } from '../types';
import plans from '../utils/plans';

const SubscriptionScreen = () => {
  const { t } = useTranslation();
  const userid = useAuthStore.getState().user?.id ?? null;
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const { mutate: createSubscription, isPending: isCreatingSubscription } = useCreateSubscription(userid);

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(subscriptionType || null);

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert(t('Error'), t('Please select a subscription plan'));
      return;
    }

    if (selectedPlan === subscriptionType) {
      Alert.alert(t('Info'), t('You are already subscribed to this plan'));
      return;
    }

    Alert.alert(
      t('Confirm Subscription'),
      t('Are you sure you want to subscribe to the {{plan}} plan?', { plan: selectedPlan }),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Subscribe'),
          onPress: () => {
            createSubscription(
              { subscriptionType: selectedPlan },
              {
                onSuccess: () => {
                  Alert.alert(t('Success'), t('Your subscription has been updated successfully'), [
                    {
                      text: 'OK',
                      onPress: () => router.push('/(app)/(member)/(tabs)/League'),
                    },
                  ]);
                },
                onError: (error) => {
                  Alert.alert(t('Error'), error.message || t('Failed to update subscription'));
                },
              }
            );
          },
        },
      ]
    );
  };

  const isLoading = isLoadingSubscription || isCreatingSubscription;

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <BackButton title={t('Subscription')} />

      {isLoading && <LoadingOverlay />}
      <ScrollView className="flex-1 ">
        <CText className="text-2xl font-bold mb-2 ">{t('Choose Your Plan')}</CText>
        <CText className="text-muted mb-6 ">
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

        {selectedPlan && selectedPlan !== subscriptionType && (
          <View className="mt-6">
            <CText style={{ textAlign: 'right' }} className="text-xl font-bold mb-4">
              ('Selected Plan'): (selectedPlan)
            </CText>
            <SubscriptionFeatures subscriptionType={selectedPlan} />

            <View className="bg-primary py-3 px-4 rounded-lg">
              <CText className="text-center text-white font-medium" onPress={handleSubscribe}>
                {isCreatingSubscription ? t('Processing...') : t('Confirm Subscription')}
              </CText>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;
