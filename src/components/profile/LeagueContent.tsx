import { leagueFullData } from '@/types/league.types';
import { Image, Text, View } from 'react-native';

const LeagueContent = ({ league }: { league: leagueFullData }) => {
  if (!league) return null;
  console.log('league', JSON.stringify(league, null, 2));

  const memberCount = league?.league_members[0]?.count || 0;
  const maxMembers = league.max_members || 0;
  const memberPercentage =
    maxMembers > 0 ? (memberCount / maxMembers) * 100 : 0;

  return (
    <View className="bg-surface rounded-xl border border-border p-4">
      <Text className="text-text text-xl font-bold mb-4">League Info</Text>

      {/* League header with logo */}
      <View className="flex-row items-center mb-4">
        {league.competition?.logo && (
          <Image
            source={{ uri: league.competition.logo }}
            className="rounded-full mr-3"
            width={40}
            height={40}
            resizeMode="contain"
          />
        )}
        <View>
          <Text className="text-text text-lg font-bold">{league.name}</Text>
          <Text className="text-text-secondary text-sm">
            {league.competition?.name} • {league.competition?.country}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-border my-3" />

      {/* League details */}
      <View className="space-y-3">
        {/* Join code */}
        <View className="flex-row justify-between">
          <Text className="text-text">Join Code</Text>
          <Text className="text-text font-semibold bg-primary/10 px-2 py-1 rounded">
            {league.join_code}
          </Text>
        </View>

        {/* Members */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-text">Members</Text>
            <Text className="text-text font-semibold">
              {memberCount} / {maxMembers}
            </Text>
          </View>
          {/* Progress bar */}
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${memberPercentage}%` }}
            />
          </View>
        </View>

        {/* Owner */}
        <View className="flex-row justify-between">
          <Text className="text-text">League Owner</Text>
          <Text className="text-text font-semibold">
            {league.owner?.nickname || 'Unknown'}
          </Text>
        </View>

        {/* Competition details */}
        {league.competition?.flag && (
          <View className="flex-row justify-between items-center">
            <Text className="text-text">Country</Text>
            <View className="flex-row items-center">
              <Image
                source={{ uri: league.competition.flag }}
                className="mr-2"
                width={20}
                height={14}
                resizeMode="contain"
              />
              <Text className="text-text font-semibold">
                {league.competition.country}
              </Text>
            </View>
          </View>
        )}

        {/* Created date */}
        <View className="flex-row justify-between">
          <Text className="text-text">Created</Text>
          <Text className="text-text-secondary">
            {new Date(league.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LeagueContent;
