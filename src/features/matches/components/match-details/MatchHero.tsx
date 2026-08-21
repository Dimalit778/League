import { BackButton, Divider, Row, TeamLogo, Text } from '@/components';
import type { MatchPresentation } from '@/features/matches/model/matchPresentation';
import type { MatchDetails, MemberPrediction, TeamType } from '@/features/matches/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useWindowDimensions, View } from 'react-native';

import { dateFormat, formatTime } from '@/utils/formats';
import { MatchPredictionEditor } from './prediction/MatchPredictionEditor';

type MatchHeroProps = {
  match: MatchDetails;
  memberPrediction?: MemberPrediction;
  presentation: MatchPresentation;
  onPredictionSaved?: () => void;
};
type ScoreProps = {
  homeScore?: number | null;
  awayScore?: number | null;
  kickOff: string;
  presentation: MatchPresentation;
};

const HeroMeta = ({ name, matchday }: { name?: string; matchday?: number | null }) => {
  const { t } = useTranslation();

  return (
    <View className="w-full justify-center ">
      <View className="absolute start-4 z-10">
        <BackButton variant="onImage" />
      </View>

      <View className="items-center justify-center px-16" pointerEvents="none">
        {name ? (
          <Text variant="subtitle" numberOfLines={1} className=" text-white">
            {name}
          </Text>
        ) : null}

        {matchday ? (
          <Text variant="label" className="text-gray-400">
            {`${t('Matchday')} ${matchday}`}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
const Score = ({ homeScore, awayScore, kickOff, presentation }: ScoreProps) => {
  if (presentation.scoreMode !== 'score') {
    return (
      <View className="  items-center justify-center">
        <Text className="mt-2 text-3xl font-semibold text-white">{formatTime(kickOff)}</Text>
        <Divider className="my-0.5 h-px w-6 bg-gray-400" />

        <Row className="gap-1 ">
          <Text variant="bodySmall" className="font-semibold text-gray-400">
            {dateFormat(kickOff)}
          </Text>
        </Row>
      </View>
    );
  }

  const home = homeScore ?? '–';
  const away = awayScore ?? '–';

  return (
    <View className=" items-center justify-center gap-1">
      {presentation.isLive ? (
        <View className="items-center ">
          <Text variant="display" className="bg-red-500 text-primary">
            {home} : {away}
          </Text>

          <Text variant="label" className="text-center text-gray-400">
            {presentation.detailStatusLabel}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text className="text-3xl font-bold text-white">{home}</Text>
          <Text className="mx-2 text-2xl text-white/70">:</Text>
          <Text className="text-3xl font-bold text-white">{away}</Text>
        </View>
      )}
    </View>
  );
};

const Team = ({ team, badgeSize }: { team: TeamType | null; badgeSize: number }) => {
  if (!team) return <View className="flex-1" />;
  const shortName = team.shortName || team.name;

  return (
    <View className="min-w-0 flex-1 items-center justify-center gap-2">
      <View className=" items-center justify-center ">
        <TeamLogo
          tla={team.tla}
          name={team.name}
          size={badgeSize}
          shape="rect"
          ratio={1.55}
          clubColors={team.clubColors}
        />
      </View>
      <Text variant="subtitle" numberOfLines={2} className="text-center text-white">
        {shortName}
      </Text>
    </View>
  );
};

export default function MatchHero({ match, memberPrediction, presentation, onPredictionSaved }: MatchHeroProps) {
  const { width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 100 : 62;

  return (
    <View>
      <HeroMeta name={match.competition?.name} matchday={match.fixture} />
      <View className="px-5 pt-6">
        <Row className="items-center justify-center">
          <Team team={match.home_team} badgeSize={badgeSize} />
          <View className="w-28 items-center justify-center">
            <Score
              homeScore={match.score?.fullTime?.home}
              awayScore={match.score?.fullTime?.away}
              kickOff={match.kick_off}
              presentation={presentation}
            />
          </View>
          <Team team={match.away_team} badgeSize={badgeSize} />
        </Row>

        {presentation.canPredict ? (
          <MatchPredictionEditor prediction={memberPrediction} matchId={match.id} onSaved={onPredictionSaved} />
        ) : null}
      </View>
    </View>
  );
}
