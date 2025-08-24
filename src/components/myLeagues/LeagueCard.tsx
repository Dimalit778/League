// import { MyLeagueType } from '@/types/league.types';
import { useUpdatePrimaryLeague } from '@/hooks/useLeagues';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueStore } from '@/store/LeagueStore';
import { MyLeagueType } from '@/types';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import StarIcon from '../../../assets/icons/StarIcon';
import LoadingOverlay from '../layout/LoadingOverlay';
import { Image } from '../ui';

const LeagueCard = ({ item }: { item: MyLeagueType }) => {
  const { user } = useAuthStore();
  const { setPrimaryLeague, leagues } = useLeagueStore();
  const router = useRouter();
  const { mutate: updatePrimaryLeague, isPending } = useUpdatePrimaryLeague(
    user?.id!
  );

  const handleSetPrimary = (leagueId: string) => {
    if (item.is_primary) {
      router.push('/(app)/(tabs)/League');
      return;
    } else {
      updatePrimaryLeague(leagueId, {
        onSuccess: () => {
          const updatedLeagues = leagues.map((league) => ({
            ...league,
            is_primary: league.id === leagueId,
          }));

          const newPrimaryLeague = updatedLeagues.find(
            (league) => league.id === leagueId
          );
          if (newPrimaryLeague) {
            setPrimaryLeague(newPrimaryLeague);
          }

          router.push('/(app)/(tabs)/League');
        },
        onError: (error) => {
          console.error('Failed to update primary league:', error);
        },
      });
    }
  };
  return (
    <>
      {isPending && <LoadingOverlay />}
      <TouchableOpacity
        onPress={() => {
          handleSetPrimary(item.id);
        }}
      >
        <View className="p-4 bg-surface rounded-xl border border-border shadow-sm">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: item.logo }}
              width={48}
              height={48}
              resizeMode="contain"
              className="rounded-lg mr-3"
            />

            <View className="flex-1">
              <Text className="text-lg font-bold text-text" numberOfLines={1}>
                {item.name}
              </Text>

              <Text className="text-sm text-textMuted">
                {item.league_members || 0}/{item.max_members} members
              </Text>
            </View>
            <View className="justify-end items-end">
              {item.is_primary && <StarIcon size={36} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default LeagueCard;
