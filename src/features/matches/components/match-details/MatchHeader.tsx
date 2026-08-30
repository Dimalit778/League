import { BackButton, Divider, Row, TeamLogo, Text } from '@/components';
import type { MatchPresentation } from '@/features/matches/model/matchPresentation';
import type { MatchDetails, MemberPrediction, TeamType } from '@/features/matches/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PredictionForm from '@/features/predictions/components/PredictionForm';
import { dateFormat } from '@/utils/formats';
import { Calendar } from 'lucide-react-native';
import { MatchHeroBackground } from './effects/MatchHeroBackground';

type MatchHeroProps = {
  match: MatchDetails;
  memberPrediction?: MemberPrediction;
  presentation: MatchPresentation;
  onPredictionSaved?: () => void;
  gradientColors: readonly [string, string, string, string];
};

const HeroMeta = ({ name, matchday, date }: { name?: string; matchday?: number | null; date: string }) => {
  const { t } = useTranslation();

  return (
    <View className="w-full flex-row items-center justify-between">
      <BackButton variant="onImage" />

      <View className="items-center ">
        <Text variant="title" size="lg" numberOfLines={1} className=" text-white">
          {name}
        </Text>

        {matchday ? (
          <Text variant="label" className="text-gray-400">
            {`${t('Matchday')} ${matchday}`}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center gap-1">
        <Text variant="label" className="text-gray-400">
          {dateFormat(date)}
        </Text>
        <Calendar size={14} color="gray" />
      </View>
    </View>
  );
};
const Score = ({ presentation }: { presentation: MatchPresentation }) => {
  if (presentation.score.kind === 'time') {
    return (
      <View className=" items-center justify-center">
        <Text className="mt-2 text-3xl font-semibold text-white">{presentation.score.time}</Text>
        <Divider className="my-0.5 h-px w-6 bg-gray-400" />

        <Row className="gap-1 ">
          <Text variant="label" className="font-semibold text-gray-400">
            {presentation.status.label}
          </Text>
        </Row>
      </View>
    );
  }

  const home = presentation.score.kind === 'score' ? presentation.score.home : '–';
  const away = presentation.score.kind === 'score' ? presentation.score.away : '–';

  return (
    <View className="flex-1 items-center justify-center">
      {presentation.isLive ? (
        <View className="items-center ">
          <Text variant="heading" size="5xl" className=" text-primary">
            {home} : {away}
          </Text>

          <Text variant="label" className="text-center text-gray-400">
            {presentation.detailStatusLabel}
          </Text>
        </View>
      ) : (
        <View className=" flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-3">
          <Text ltr className="text-center text-4xl font-manrope-bold text-white" style={{ lineHeight: 42 }}>
            {home} : {away}
          </Text>
        </View>
      )}
    </View>
  );
};

const Team = ({ team, badgeSize }: { team: TeamType | null; badgeSize: number }) => {
  if (!team) return <View className="flex-1" />;
  const shortName = team.shortName || team.name;

  return (
    <View className=" items-center justify-center gap-2">
      <TeamLogo tla={team.tla} size={badgeSize} shape="rect" clubColors={team.clubColors} variant="match" />
      <Text variant="title" size="lg" numberOfLines={2} className="text-center text-gray-300">
        {shortName}
      </Text>
    </View>
  );
};

export default function MatchHeader({
  match,
  memberPrediction,
  presentation,
  onPredictionSaved,
  gradientColors,
}: MatchHeroProps) {
  const insets = useSafeAreaInsets();
  const { width, height, fontScale } = useWindowDimensions();
  const isTablet = width >= 768;
  const badgeSize = isTablet ? 100 : 75;
  const fontScaleExtra = Math.max(0, fontScale - 1) * 40;

  const heroHeight = presentation.canPredict
    ? Math.min(height * 0.4, Math.max(height * 0.52 + fontScaleExtra, isTablet ? 400 : 340))
    : Math.min(height * 0.31, Math.max(height * 0.31 + fontScaleExtra, isTablet ? 360 : 260));

  return (
    <View style={{ minHeight: heroHeight }}>
      <MatchHeroBackground gradientColors={gradientColors} />
      <View className="flex-1" style={{ paddingTop: insets.top, paddingHorizontal: 16 }}>
        <HeroMeta name={match.competition?.name} matchday={match.fixture} date={match.kick_off} />
        <View className="flex-1 justify-center gap-4">
          <View className="flex-row items-center justify-around">
            <Team team={match.home_team} badgeSize={badgeSize} />
            <Score presentation={presentation} />

            <Team team={match.away_team} badgeSize={badgeSize} />
          </View>
          {presentation.canPredict ? (
            <PredictionForm prediction={memberPrediction} matchId={match.id} onSaveSuccess={onPredictionSaved} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
