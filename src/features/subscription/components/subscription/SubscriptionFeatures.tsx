import { CText } from '@/components/ui/CText';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
import { SubscriptionType } from '../../types';

interface SubscriptionFeaturesProps {
  subscriptionType: SubscriptionType;
}

const SubscriptionFeatures = ({ subscriptionType }: SubscriptionFeaturesProps) => {
  const { t } = useTranslation();
  const getFeatures = () => {
    const baseFeatures = [
      t('Join up to 2 leagues'),
      t('Create leagues with up to 6 members'),
      t('Basic prediction stats'),
    ];

    const basicFeatures = [
      t('Join up to 3 leagues'),
      t('Create leagues with up to 8 members'),
      t('Advanced prediction stats'),
      t('League history'),
    ];

    const premiumFeatures = [
      t('Join up to 5 leagues'),
      t('Create leagues with up to 10 members'),
      t('Advanced prediction stats'),
      t('League history'),
      t('Custom league settings'),
      t('Priority support'),
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
      <CText className="text-text font-bold text-lg mb-2">{t('Features')}</CText>
      {features.map((feature, index) => (
        <View key={index} className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <CText className="text-text">{t(feature)}</CText>
        </View>
      ))}
    </View>
  );
};

export default SubscriptionFeatures;
