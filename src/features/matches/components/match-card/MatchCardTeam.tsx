import { MyImage, Text } from '@/components';
import { View } from 'react-native';
import type { MatchCardTeamData } from './types';

type MatchCardTeamProps = {
  team: MatchCardTeamData;
  width: number;
  logoWidth: number;
  logoHeight: number;
};

export function MatchCardTeam({ team, width, logoWidth, logoHeight }: MatchCardTeamProps) {
  return (
    <View style={{ width }} className="mt-2 items-center gap-1">
      <View style={{ width: logoWidth, height: logoHeight }} className="items-center justify-center overflow-hidden">
        <MyImage
          source={team.logo}
          width={logoWidth}
          height={logoHeight}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
        />
      </View>
      <View className="mt-0.5 h-6 w-[95%] items-center justify-start">
        <Text variant="bodySmall" numberOfLines={2} ellipsizeMode="tail">
          {team.name}
        </Text>
      </View>
    </View>
  );
}
