import { LogoBadge } from '@/components/LogoBadge';
import { MyImage } from '@/components/ui';
import { Text, View } from 'react-native';
import { FullLeagueType } from '../types';

export default function FullLeagueCard({ league }: { league: FullLeagueType }) {
  return (
    <View className="bg-border rounded-2xl p-4 mx-5">
      <View className="items-center gap-2">
        <LogoBadge source={league.competition_logo} width={80} height={80} />

        <Text
          className="text-primary font-nunito-bold text-2xl text-center uppercase"
          style={{
            letterSpacing: 1,
          }}
        >
          {league.league_name}
        </Text>
      </View>

      <View className="h-[1px] bg-muted my-3" />

      <View className="gap-3">
        <View>
          <View className="flex-row justify-between ">
            <Text className="text-text">Members</Text>
            <Text className="text-text font-semibold">
              {league.members_count || 0} / {league.max_members}
            </Text>
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Owner */}
        <View className="flex-row justify-between">
          <Text className="text-text">League Owner</Text>
          <Text className="text-text font-semibold">{league.owner_nickname}</Text>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Competition details */}
        <View className="flex-row justify-between">
          <Text className="text-text">League</Text>
          <View className="flex-row items-center">
            <Text className="text-text font-semibold mr-2">{league.competition_name}</Text>
            <LogoBadge source={{ uri: league.competition_logo }} width={18} height={18} />
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        <View className="flex-row justify-between items-center pb-1">
          <Text className="text-text">Country</Text>
          <View className="flex-row items-center">
            <Text className="text-text font-semibold mr-2">{league.competition_area}</Text>
            <MyImage source={league.competition_flag} width={18} height={18} resizeMode="contain" />
          </View>
        </View>
      </View>
    </View>
  );
}
