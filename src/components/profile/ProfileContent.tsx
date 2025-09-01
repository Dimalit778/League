import { useThemeStore } from '@/store/ThemeStore';
import { Tables } from '@/types/database.types';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RelativePathString, useRouter } from 'expo-router';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

const ProfileContent = ({
  created_at = 'N/A',
  subscription,
}: {
  created_at?: string;
  subscription: Tables<'subscription'> | undefined;
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
          <AntDesign
            name="right"
            size={16}
            color={theme === 'dark' ? 'white' : 'black'}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  return (
    <View className="py-4">
      {/* Profile Information */}
      <View className="bg-surface  p-4 mb-4">
        <View className="gap-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-text text-base">Subscription</Text>
            <View className="bg-secondary rounded-md px-2 py-1">
              <Text className="text-black text-sm ">{subscriptionType}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-text text-base ">Joined On</Text>
            <Text className="text-text text-base">{createdAtDateString}</Text>
          </View>
        </View>
      </View>
      <View>
        {/* Account Actions */}
        {renderAccountActions(
          'Account',
          '/(app)/profile' as RelativePathString
        )}

        {renderAccountActions(
          'Subscription',
          '/(app)/subscription' as RelativePathString
        )}

        {/* {renderAccountActions('Privacy Settings', '/(app)/(tabs)/Profile')}

        {renderAccountActions('Help & Support', '/(app)/(tabs)/Help')} */}
      </View>
    </View>
  );
};

export default ProfileContent;
