import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';

import { CText } from '@/components/ui/CText';
import SubscriptionCard from '@/features/subscription/components/subscription/SubscriptionCard';
import { useCreateSubscription, useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubscriptionType } from '../types';
import plans from '../utils/plans';

const SubscriptionScreen = () => {
  const { t } = useTranslation();
  const userid = useAuthStore.getState().user?.id ?? null;
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const { mutate: createSubscription, isPending: isCreatingSubscription } = useCreateSubscription(userid);

  const subscriptionType = currentSubscription?.subscription_type || 'FREE';

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(subscriptionType || null);
  const edges = useSafeAreaInsets();

  const isLoading = isLoadingSubscription || isCreatingSubscription;

  return (
    <Screen withSafeArea>
      <BackButton title={t('Subscription')} />

      {isLoading && <LoadingOverlay />}
      <ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: edges.bottom + 10, paddingHorizontal: 10 }}
      >
        <CText variant="h2" className="my-2">
          {t('Choose Your Plan')}
        </CText>
        <CText variant="caption" bold className="text-muted mb-6 ">
          {t('Upgrade your subscription to access more features and create larger leagues')}
        </CText>

        {plans.map((p) => (
          <SubscriptionCard
            key={p.type}
            type={p.type}
            price={p.price}
            features={p.features}
            isActive={subscriptionType === p.type}
            onSelect={() => setSelectedPlan(p.type)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
};

export default SubscriptionScreen;
