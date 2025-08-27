// import { MyLeagueType } from '@/types/league.types';
import { useUpdatePrimaryLeague } from '@/hooks/useLeagues';
import { MyLeagueType } from '@/types';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import StarIcon from '../../../assets/icons/StarIcon';
import LoadingOverlay from '../layout/LoadingOverlay';
import { Card, Image } from '../ui';

const LeagueCard = ({ item }: { item: MyLeagueType }) => {
  const router = useRouter();
  const { mutate: updatePrimaryLeague, isPending } = useUpdatePrimaryLeague();

  const handleSetPrimary = async (leagueId: string) => {
    if (item.is_primary) {
      router.push('/(app)/(tabs)/League');
      return;
    } else {
      updatePrimaryLeague(leagueId);
    }
  };
  return (
    <Card className="mx-3 my-1 p-4">
      {isPending && <LoadingOverlay />}
      <TouchableOpacity
        onPress={() => {
          handleSetPrimary(item.id);
        }}
      >
        <View className="flex-row items-center ">
          <Image
            source={{ uri: item.logo }}
            width={48}
            height={48}
            resizeMode="contain"
            className="rounded-lg mr-3"
          />

          <View className="flex-1 ms-4">
            <Text
              className="text-2xl font-headBold text-text"
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text className="text-base text-muted">
              {item.league_members || 0}/{item.max_members} members
            </Text>
          </View>
          <View className="justify-end items-end">
            {item.is_primary && <StarIcon size={36} />}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default LeagueCard;
