import { Text, View } from 'react-native';
import ThemeToggle from '../ThemeToggle';

const ProfileHeader = ({
  fullName = '',
  email = '',
}: {
  fullName?: string;
  email?: string;
}) => {
  return (
    <View className="flex-row p-4 my-2 mx-3 bg-surface rounded-xl border border-border items-center">
      <View className="bg-primary rounded-full w-20 h-20 justify-center items-center">
        <Text className="text-text text-2xl font-bold">
          {(fullName || email || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-grow pl-4">
        <Text className="text-text text-3xl font-headBold">{fullName}</Text>
        <Text className="text-muted text-base">{email}</Text>
      </View>
      <ThemeToggle />
    </View>
  );
};

export default ProfileHeader;
