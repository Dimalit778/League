import { useThemeStore } from '@/store/ThemeStore';
import { Tables } from '@/types/database.types';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RelativePathString, useRouter } from 'expo-router';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import ThemeToggle from '../ThemeToggle';

const SettingsContent = ({
  created_at = 'N/A',
  subscription,
  email,
}: {
  created_at?: string;
  subscription: Tables<'subscription'> | undefined;
  email?: string;
}) => {
  const { theme } = useThemeStore();
  const router = useRouter();

  const createdAtDateString = new Date(created_at).toLocaleDateString();
  const subscriptionType = subscription?.subscription_type || 'Free';

  const renderAccountActions = (title: string, path?: RelativePathString) => {
    const handlePress = () => {
      if (path) {
        router.push(path);
      }
    };

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">{title}</Text>
          <AntDesign name="right" size={16} color={theme === 'dark' ? 'white' : 'black'} />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  return (
    <>
      {/* Profile Information */}
      <View className="border-b border-primary">
        {/* Theme Toggle */}
        <View className="border-t border-b border-border py-3 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base">Theme</Text>
          <ThemeToggle />
        </View>
        {/* Subscription */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base">Subscription</Text>

          <Text className="text-primary text-sm font-medium ">{subscriptionType}</Text>
        </View>
        {/* Email */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">Email</Text>
          <Text className="text-text text-base">{email}</Text>
        </View>
        {/* Joined On */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">Joined On</Text>
          <Text className="text-text text-base">{createdAtDateString}</Text>
        </View>
      </View>

      <View>
        {renderAccountActions('Subscription', '/(app)/subscription' as RelativePathString)}

        {renderAccountActions('Privacy Settings', '/settings/privacy' as RelativePathString)}

        {renderAccountActions('Help & Support', '/settings/help' as RelativePathString)}
      </View>
    </>
  );
};

export default SettingsContent;
