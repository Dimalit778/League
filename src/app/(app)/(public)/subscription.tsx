import { Screen } from '@/components/layout';
import { BackButton, Button, CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaywall, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { View } from 'react-native';

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const openPaywall = usePaywall();
  const { subscription, isLoading, isOffline } = useRevenueCatSubscription();

  return (
    <Screen withSafeArea>
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
          onPress={openPaywall}
        />
      </View>
    </Screen>
  );
}
