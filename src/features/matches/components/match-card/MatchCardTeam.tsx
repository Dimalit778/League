import { TeamLogo, Text } from '@/components';
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
    <View style={{ width }} className=" items-center gap-1 ">
      <View style={{ width: logoWidth, height: logoHeight }} className="items-center justify-center overflow-hidden">
        <TeamLogo tla={team.tla} clubColors={team.clubColors} size={logoWidth} radius={logoWidth / 2} />
      </View>

      <Text variant="label" numberOfLines={2} ellipsizeMode="tail">
        {team.name}
      </Text>
    </View>
  );
}
