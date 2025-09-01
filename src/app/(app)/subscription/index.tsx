import { LoadingOverlay, Screen } from '@/components/layout';
import {
  SubscriptionCard,
  SubscriptionFeatures,
} from '@/components/subscription';
import { BackButton } from '@/components/ui';
import {
  useCreateSubscription,
  useSubscription,
} from '@/hooks/useSubscription';
import { SubscriptionType } from '@/services/subscriptionService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

export default function SubscriptionScreen() {
  const { data: currentSubscription, isLoading: isLoadingSubscription } =
    useSubscription();
  const { mutate: createSubscription, isPending: isCreatingSubscription } =
    useCreateSubscription();

  // Ensure we always have a subscription type, even if the query is still loading
  const subscriptionType = currentSubscription?.subscription_type || 'FREE';

  console.log(
    'currentSubscription',
    JSON.stringify(currentSubscription, null, 2)
  );

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(
    subscriptionType || null
  );

  const handleSelectPlan = (plan: SubscriptionType) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    if (selectedPlan === subscriptionType) {
      Alert.alert('Info', 'You are already subscribed to this plan');
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Are you sure you want to subscribe to the ${selectedPlan} plan?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Subscribe',
          onPress: () => {
            createSubscription(
              { subscriptionType: selectedPlan },
              {
                onSuccess: () => {
                  Alert.alert(
                    'Success',
                    'Your subscription has been updated successfully',
                    [
                      {
                        text: 'OK',
                        onPress: () => router.push('/(app)/(tabs)/League'),
                      },
                    ]
                  );
                },
                onError: (error) => {
                  Alert.alert(
                    'Error',
                    error.message || 'Failed to update subscription'
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  const isLoading = isLoadingSubscription || isCreatingSubscription;

  const subscriptionPlans = [
    {
      type: 'FREE' as SubscriptionType,
      price: 'Free',
      features: [
        'Join up to 2 leagues',
        'Create leagues with up to 6 members',
        'Basic prediction stats',
      ],
    },
    {
      type: 'BASIC' as SubscriptionType,
      price: '$4.99/mo',
      features: [
        'Join up to 3 leagues',
        'Create leagues with up to 8 members',
        'Advanced prediction stats',
        'League history',
      ],
    },
    {
      type: 'PREMIUM' as SubscriptionType,
      price: '$9.99/mo',
      features: [
        'Join up to 5 leagues',
        'Create leagues with up to 10 members',
        'Advanced prediction stats',
        'League history',
        'Custom league settings',
        'Priority support',
      ],
    },
  ];

  return (
    <Screen>
      <BackButton />

      {isLoading && <LoadingOverlay />}
      <ScrollView className="flex-1 p-4">
        <Text className="text-text text-2xl font-bold mb-2">
          Choose Your Plan
        </Text>
        <Text className="text-muted mb-6">
          Upgrade your subscription to access more features and create larger
          leagues
        </Text>

        {subscriptionPlans.map((plan) => (
          <SubscriptionCard
            key={plan.type}
            type={plan.type}
            price={plan.price}
            features={plan.features}
            isActive={subscriptionType === plan.type}
            onSelect={() => handleSelectPlan(plan.type)}
          />
        ))}

        {selectedPlan && selectedPlan !== subscriptionType && (
          <View className="mt-6">
            <Text className="text-text text-xl font-bold mb-4">
              Selected Plan: {selectedPlan}
            </Text>
            <SubscriptionFeatures subscriptionType={selectedPlan} />

            <View className="bg-primary py-3 px-4 rounded-lg">
              <Text
                className="text-center text-white font-medium"
                onPress={handleSubscribe}
              >
                {isCreatingSubscription
                  ? 'Processing...'
                  : 'Confirm Subscription'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
