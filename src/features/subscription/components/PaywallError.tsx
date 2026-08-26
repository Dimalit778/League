import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Pressable, View } from 'react-native';

type PaywallErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function PaywallError({ message, onRetry }: PaywallErrorProps) {
  const { t } = useTranslation();

  return (
    <View className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
      <Text testID="paywall-error" className="text-center text-sm text-red-200">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Try again')}
          className="mt-2 min-h-12 self-center justify-center px-3"
          onPress={onRetry}
        >
          <Text className="font-bold text-[#F4C64E]">{t('Try again')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
