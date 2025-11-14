import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';

const SubscriptionLayout = () => {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default SubscriptionLayout;
