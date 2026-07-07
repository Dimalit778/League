import { Screen } from '@/components/layout';
import { BackButton, Button, CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useManageSubscription, useRestorePurchases, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { formatErrorForUser } from '@/utils/errorFormats';
import { useCallback, useState } from 'react';
import { Alert, Platform, View } from 'react-native';

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const manageSubscription = useManageSubscription();
  const restorePurchases = useRestorePurchases();
  const { subscription, isLoading, isOffline } = useRevenueCatSubscription();
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
      <BackButton title={t('Subscription')} />
      <View className="flex-1 px-4 pt-6 gap-4">
        <View className="rounded-2xl border border-border bg-surface p-5 gap-3">
          <CText variant="h2">{subscription.isActive ? t('PRO') : t('FREE')}</CText>
          <CText variant="body" className="text-muted">
            {subscription.isActive
              ? t('Your PRO subscription is active.')
              : t('Upgrade to create more leagues and unlock more competitions.')}
          </CText>
          {isOffline && (
            <CText variant="caption" className="text-muted">
              {t('Subscription status may be outdated while offline.')}
            </CText>
          )}
        </View>

        <Button
          title={subscription.isActive ? t('Manage Subscription') : t('Upgrade')}
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isRestoring}
          onPress={manageSubscription}
        />

        {Platform.OS !== 'web' && (
          <Button
            title={t('Restore Purchases')}
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
