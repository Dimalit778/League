import { CText } from '@/components/ui/CText';
import { useTranslation } from '@/hooks/useTranslation';
import { TouchableOpacity, View } from 'react-native';
import { SubscriptionType } from '../../types';
interface SubscriptionCardProps {
  type: SubscriptionType;
  price: string;
  isActive?: boolean;
  features: string[];
  onSelect: () => void;
}
const getTypeColor = (type: SubscriptionType) => {
  switch (type) {
    case 'FREE':
      return 'bg-gray-500';
    case 'BASIC':
      return 'bg-blue-500';
    case 'PREMIUM':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const SubscriptionCard = ({ type, price, features, isActive = false, onSelect }: SubscriptionCardProps) => {
  const { t } = useTranslation();
  return (
    <View className={`rounded-lg border ${isActive ? 'border-primary border-2' : 'border-border'} p-4 mb-4 bg-surface`}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full ${getTypeColor(type)} mr-2`} />
          <CText className="font-bold text-lg">{t(type)}</CText>
        </View>
        <CText className="text-primary font-bold text-xl">
          {t(price)}/{t('mo')}
        </CText>
      </View>

      <View className="mb-4">
        {features.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-2">
            <CText className="text-sm">• {t(feature)}</CText>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onSelect}
        className={`py-2  rounded-lg ${isActive ? '' : 'bg-primary'}`}
        disabled={isActive}
      >
        <CText
          className={`text-center ${isActive ? 'text-primary font-headBold text-2xl' : 'text-background font-medium text-lg'}`}
        >
          {isActive ? t('Current Plan') : t('Select Plan')}
        </CText>
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionCard;
