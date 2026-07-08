import { Text } from '@/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

type Props = {
  label?: string;
};

export const SubscriptionBadge = ({ label = 'Premium' }: Props) => {
  return (
    <Pressable
      onPress={() => router.push('/(app)/(user)/settings/subscription')}
      className="absolute top-2 right-2 flex-row items-center gap-1 rounded-full px-3 py-1.5 bg-secondary/90"
    >
      <LinearGradient colors={['#F6C453', '#E2A200']} className="absolute top-2 right-2 rounded-full px-3 py-1.5">
        <Text variant="small" className="text-muted text-center mt-2">
          Premium
        </Text>
      </LinearGradient>
    </Pressable>
  );
};
