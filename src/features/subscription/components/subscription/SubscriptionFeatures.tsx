import { CText } from '@/components/ui/CText';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
import { SubscriptionType } from '../../types';

interface SubscriptionFeaturesProps {
  subscriptionType: SubscriptionType;
}

const SubscriptionFeatures = ({
  subscriptionType,
}: SubscriptionFeaturesProps) => {
  const { t } = useTranslation();
  const getFeatures = () => {
    const freeFeatures = [
      t('Join or create up to 2 leagues'),
      t('Create leagues with up to 6 members'),
      t('English & Italian leagues only'),
    ];

    const proFeatures = [
      t('Join or create up to 5 leagues'),
      t('Create leagues with up to 12 members'),
      t('All competitions'),
      t('Advanced prediction stats'),
    ];

    switch (subscriptionType) {
      case 'PRO':
        return proFeatures;
      case 'FREE':
      default:
        return freeFeatures;
    }
  };

  const features = getFeatures();

  return (
    <View className="mb-4">
      <CText className="text-text font-bold text-lg mb-2">
        {t('Features')}
      </CText>
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
