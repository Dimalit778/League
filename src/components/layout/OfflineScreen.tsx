import { Screen } from './Screens';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

export function OfflineScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      await NetInfo.refresh();
    } catch {
      // Keep the retry screen available if the native reachability probe fails.
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Screen padding="all" edges={['top', 'bottom']}>
      <View className="h-2/3 items-center justify-center gap-6">
        <View className="h-24 w-24 items-center justify-center rounded-3xl bg-surface border border-subtle">
          <WifiOff size={48} color={colors.primary} strokeWidth={1.5} />
        </View>

        <Text variant="heading" size="3xl">{t("You're offline")}</Text>
        <Text variant="body" tone="secondary" className="text-center">
          {t('Check your connection and try again')}
        </Text>

        <View className="w-full px-8">
          <Button
            intent="primary"
            size="lg"
            loading={isChecking}
            onPress={handleRetry}
            label={isChecking ? t('Checking...') : t('Try Again')}
          />
        </View>
      </View>
    </Screen>
  );
}
