import { CText, MyImage } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { View } from 'react-native';
import { FullLeagueType } from '../types';

export default function FullLeagueCard({ league }: { league: FullLeagueType }) {
  return (
    <View className="bg-border rounded-2xl p-4 mx-5">
      <View className="items-center gap-2">
        <LogoBadge source={league.competition_logo} width={80} height={80} />

        <CText
          className="text-primary font-nunito-bold text-2xl text-center uppercase"
          style={{
            letterSpacing: 1,
          }}
        >
          {league.league_name}
        </CText>
      </View>

      <View className="h-[1px] bg-muted my-3" />

      <View className="gap-3">
        <View>
          <View className="flex-row justify-between ">
            <CText className="text-text">Members</CText>
            <CText className="text-text font-semibold">
              {league.members_count || 0} / {league.max_members}
            </CText>
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Owner */}
        <View className="flex-row justify-between">
          <CText className="text-text">League Owner</CText>
          <CText className="text-text font-semibold">{league.owner_nickname}</CText>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Competition details */}
        <View className="flex-row justify-between">
          <CText className="text-text">League</CText>
          <View className="flex-row items-center">
            <CText className="text-text font-semibold mr-2">{league.competition_name}</CText>
            <LogoBadge source={{ uri: league.competition_logo }} width={18} height={18} />
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        <View className="flex-row justify-between items-center pb-1">
          <CText className="text-text">Country</CText>
          <View className="flex-row items-center">
            <CText className="text-text font-semibold mr-2">{league.competition_area}</CText>
            <MyImage source={league.competition_flag} width={18} height={18} resizeMode="contain" />
          </View>
        </View>
      </View>
    </View>
  );
}
