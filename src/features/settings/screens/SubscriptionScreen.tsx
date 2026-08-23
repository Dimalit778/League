import { Button, Screen, Text } from '@/components';
import { useSubscriptionAccess } from '@/features/subscription/hooks/useSubscriptionAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaywall, useRestorePurchases } from '@/lib/revenuecat/purchases';
import { formatErrorForUser } from '@/utils/errorFormats';
import { useCallback, useState } from 'react';
import { Alert, Platform, View } from 'react-native';

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const openPaywall = usePaywall();
  const restorePurchases = useRestorePurchases();
  const accessQuery = useSubscriptionAccess();
  const isPro = accessQuery.data?.planCode === 'pro';
  const isLoading = accessQuery.isPending;
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchases = useCallback(async () => {
    try {
      setIsRestoring(true);
      const restored = await restorePurchases();

      if (restored) {
        Alert.alert(t('Subscription'), t('Your subscription has been updated successfully'));
        return;
      }

      Alert.alert(t('Subscription'), t('No purchases found to restore'));
    } catch (error) {
      Alert.alert(t('Error'), formatErrorForUser(error) || t('Failed to restore purchases'));
    } finally {
      setIsRestoring(false);
    }
  }, [restorePurchases, t]);

  return (
    <Screen edges={['top']}>
      <View className="flex-1 px-4 pt-6 gap-4">
        <View className="rounded-2xl border border-border bg-surface p-5 gap-3">
          <Text className="text-2xl">{isPro ? t('PRO') : t('FREE')}</Text>
          <Text className="text-base text-muted">
            {isPro
              ? t('Your PRO subscription is active.')
              : t('Upgrade to create more leagues and unlock more competitions.')}
          </Text>
        </View>

        {!isPro && (
          <Button
            label={t('Upgrade')}
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isRestoring}
            onPress={openPaywall}
          />
        )}

        {Platform.OS !== 'web' && (
          <Button
            label={t('Restore Purchases')}
            variant="outline"
            size="lg"
            loading={isRestoring}
            disabled={isLoading}
            onPress={handleRestorePurchases}
          />
        )}
      </View>
    </Screen>
  );
}
