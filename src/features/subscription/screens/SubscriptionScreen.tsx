import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { SubscriptionType } from '@/features/subscription/api/subscriptionApi';
import SubscriptionCard from '@/features/subscription/components/subscription/SubscriptionCard';
import SubscriptionFeatures from '@/features/subscription/components/subscription/SubscriptionFeatures';
import { useCreateSubscription, useSubscription } from '@/features/subscription/hooks/useSubscription';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import plans from '../utils/plans';

const SubscriptionScreen = () => {
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const { mutate: createSubscription, isPending: isCreatingSubscription } = useCreateSubscription();

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(subscriptionType || null);

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    if (selectedPlan === subscriptionType) {
      Alert.alert('Info', 'You are already subscribed to this plan');
      return;
    }

    Alert.alert('Confirm Subscription', `Are you sure you want to subscribe to the ${selectedPlan} plan?`, [
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
                Alert.alert('Success', 'Your subscription has been updated successfully', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(app)/(member)/(tabs)/League'),
                  },
                ]);
              },
              onError: (error) => {
                Alert.alert('Error', error.message || 'Failed to update subscription');
              },
            }
          );
        },
      },
    ]);
  };

  const isLoading = isLoadingSubscription || isCreatingSubscription;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Subscription" />

      {isLoading && <LoadingOverlay />}
      <ScrollView className="flex-1 p-4">
        <Text className="text-text text-2xl font-bold mb-2">Choose Your Plan</Text>
        <Text className="text-muted mb-6">
          Upgrade your subscription to access more features and create larger leagues
        </Text>

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
            <Text className="text-text text-xl font-bold mb-4">Selected Plan: {selectedPlan}</Text>
            <SubscriptionFeatures subscriptionType={selectedPlan} />

            <View className="bg-primary py-3 px-4 rounded-lg">
              <Text className="text-center text-white font-medium" onPress={handleSubscribe}>
                {isCreatingSubscription ? 'Processing...' : 'Confirm Subscription'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;
