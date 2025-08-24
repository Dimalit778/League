import { useLeagueStore } from '@/store/LeagueStore';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { SettingsIcon, TrophyIcon } from '../../../assets/icons';
const TopBar = ({ showLeagueName = false }: { showLeagueName?: boolean }) => {
  const { primaryLeague } = useLeagueStore();
  return (
    <SafeAreaView className="bg-background">
      <View className="flex-row justify-between items-center px-4 py-2">
        <Link href="/profile" asChild>
          <Pressable>
            <SettingsIcon size={30} color={'#f97316'} />
          </Pressable>
        </Link>
        {showLeagueName && (
          <Text className="text-primary font-bold text-2xl">
            {primaryLeague?.name}
          </Text>
        )}

        <Link href="/myLeagues" asChild>
          <Pressable>
            <TrophyIcon size={30} color={'#f97316'} />
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;
