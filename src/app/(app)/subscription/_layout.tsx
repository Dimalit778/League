import { Stack } from 'expo-router';

const SubscriptionLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default SubscriptionLayout;
