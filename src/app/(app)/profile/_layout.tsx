import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

const ProfileLayout = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="edit-league" />
      </Stack>
    </SafeAreaView>
  );
};

export default ProfileLayout;
