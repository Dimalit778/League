import { SubscriptionType } from '@/services/subscriptionService';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionStatusProps {
  subscriptionType: SubscriptionType | null;
  expiresAt?: string | null;
}

const SubscriptionStatus = ({
  subscriptionType = 'FREE',
  expiresAt = null,
}: SubscriptionStatusProps) => {
  const getStatusColor = () => {
    switch (subscriptionType) {
      case 'PREMIUM':
        return 'bg-yellow-500';
      case 'BASIC':
        return 'bg-blue-500';
      case 'FREE':
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!subscriptionType || subscriptionType === 'FREE') {
      return 'Free Plan';
    }

    return `${subscriptionType} Plan`;
  };

  const formatExpiryDate = () => {
    if (!expiresAt) return null;

    const date = new Date(expiresAt);
    return date.toLocaleDateString();
  };

  const navigateToSubscription = () => {
    router.push('/(app)/subscription');
  };

  return (
    <TouchableOpacity
      onPress={navigateToSubscription}
      className="flex-row items-center justify-between p-4 bg-surface rounded-lg border border-border mb-4"
    >
      <View className="flex-row items-center">
        <View className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`} />
        <Text className="text-text font-medium">{getStatusText()}</Text>
      </View>

      {expiresAt && subscriptionType !== 'FREE' && (
        <Text className="text-textMuted text-sm">
          Expires: {formatExpiryDate()}
        </Text>
      )}

      {(!subscriptionType || subscriptionType === 'FREE') && (
        <View className="bg-primary px-2 py-1 rounded">
          <Text className="text-white text-xs font-medium">Upgrade</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SubscriptionStatus;
