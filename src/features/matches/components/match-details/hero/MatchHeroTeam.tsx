import { MyImage, Text } from '@/components';
import type { TeamType } from '@/features/matches/types';
import { View } from 'react-native';

export function MatchHeroTeam({ team, badgeSize }: { team: TeamType | null; badgeSize: number }) {
  if (!team) return <View className="flex-1" />;
  const shortName = team.shortName || team.name;

  return (
    <View className="min-w-0 flex-1 items-center justify-center gap-2" accessible accessibilityLabel={shortName}>
      <View style={{ width: badgeSize, height: badgeSize }} className="items-center justify-center overflow-hidden">
        <MyImage source={team.logo} width={badgeSize} height={badgeSize} contentFit="contain" />
      </View>
      <Text variant="subtitle" numberOfLines={2} className="text-center text-white">
        {shortName}
      </Text>
    </View>
  );
}
