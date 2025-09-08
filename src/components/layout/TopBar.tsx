import { useMemberStore } from '@/store/MemberStore';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SettingsIcon, TrophyIcon } from '../../../assets/icons';
const TopBar = ({ showLeagueName = false }: { showLeagueName?: boolean }) => {
  const { member } = useMemberStore();
  console.log('--------------', JSON.stringify(member, null, 2));

  return (
    <View className="flex-row justify-between items-center py-2 px-4">
      <Link href="/settings" asChild>
        <Pressable>
          <SettingsIcon size={30} color={'#f97316'} />
        </Pressable>
      </Link>
      {showLeagueName && (
        <Text className="text-primary font-bold text-2xl">
          {member?.league?.name}
        </Text>
      )}

      <Link href="/myLeagues" asChild>
        <Pressable>
          <TrophyIcon size={30} color={'#f97316'} />
        </Pressable>
      </Link>
    </View>
  );
};

export default TopBar;
