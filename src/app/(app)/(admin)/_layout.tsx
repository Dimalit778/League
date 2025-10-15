import { Stack } from 'expo-router';

const AdminLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="leagues" />
      <Stack.Screen name="league-members" />
      <Stack.Screen name="predictions" />
      <Stack.Screen name="competitions" />
    </Stack>
  );
};

export default AdminLayout;
