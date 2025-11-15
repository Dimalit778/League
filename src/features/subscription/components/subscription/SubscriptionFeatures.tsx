import { Text, View } from 'react-native';
import { SubscriptionType } from '../../api/subscriptionApi';

interface SubscriptionFeaturesProps {
  subscriptionType: SubscriptionType;
}

const SubscriptionFeatures = ({ subscriptionType }: SubscriptionFeaturesProps) => {
  const getFeatures = () => {
    const baseFeatures = ['Join up to 2 leagues', 'Create leagues with up to 6 members', 'Basic prediction stats'];

    const basicFeatures = [
      'Join up to 3 leagues',
      'Create leagues with up to 8 members',
      'Advanced prediction stats',
      'League history',
    ];

    const premiumFeatures = [
      'Join up to 5 leagues',
      'Create leagues with up to 10 members',
      'Advanced prediction stats',
      'League history',
      'Custom league settings',
      'Priority support',
    ];

    switch (subscriptionType) {
      case 'PREMIUM':
        return premiumFeatures;
      case 'BASIC':
        return basicFeatures;
      case 'FREE':
      default:
        return baseFeatures;
    }
  };

  const features = getFeatures();

  return (
    <View className="mb-4">
      <Text className="text-text font-bold text-lg mb-2">Features</Text>
      {features.map((feature, index) => (
        <View key={index} className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text className="text-text">{feature}</Text>
        </View>
      ))}
    </View>
  );
};

export default SubscriptionFeatures;
