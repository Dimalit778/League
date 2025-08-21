import { useLeagueStore } from '@/store/LeagueStore';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { TrophyIcon } from '../../../assets/icons';
const TabsHeader = () => {
  const { primaryLeague } = useLeagueStore();

  return (
    <SafeAreaView className="bg-background">
      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="text-2xl text-primary font-bold">
          {primaryLeague?.name}
        </Text>
        <View className="flex-row items-center">
          <Link href="/myLeagues" asChild>
            <Pressable>
              <TrophyIcon size={30} color={'#f97316'} />
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TabsHeader;
