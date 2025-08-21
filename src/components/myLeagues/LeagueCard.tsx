// import { MyLeagueType } from '@/types/league.types';
import { useUpdatePrimaryLeague } from '@/hooks/useLeagues';
import { useAuthStore } from '@/store/AuthStore';
import { MyLeagueType } from '@/types/league.types';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import StarIcon from '../../../assets/icons/StarIcon';
import ImageC from '../ui/Image';

const LeagueCard = ({ item }: { item: MyLeagueType }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { mutate: updatePrimaryLeague, isPending } = useUpdatePrimaryLeague(
    user?.id!
  );
  const handleSetPrimary = (leagueId: string) => {
    // If already primary, just navigate
    if (item.is_primary) {
      router.push('/(app)/(tabs)/League');
      return;
    }

    // If not primary and not already updating, update then navigate
    if (!isPending) {
      updatePrimaryLeague(leagueId, {
        onSuccess: () => {
          console.log('Primary league updated');
          router.push('/(app)/(tabs)/League');
        },
        onError: (error) => {
          console.error('Failed to update primary league:', error);
        },
      });
    }
  };
  return (
    <TouchableOpacity
      onPress={() => {
        handleSetPrimary(item.id);
      }}
    >
      <View className="p-4 bg-surface rounded-xl border border-border shadow-sm">
        <View className="flex-row items-center gap-4">
          <ImageC
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
            {item.is_primary && <StarIcon width={36} height={36} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LeagueCard;
