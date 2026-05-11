import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { formatTime } from '@/utils/formats';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import TeamBadge from '../TeamBadge';

/** Tournament list row card — dense dark sheet, RTL-aware via RN layout direction. */
const CARD = {
  bg: '#161b22',
  border: 'rgba(255,255,255,0.06)',
  badgeBg: '#2d333b',
  venue: '#a0a0a0',
} as const;

const LOGO_SIZE = 40;
const TEAM_NAME_LINE_HEIGHT = 22;

type Props = {
  match: MatchWithPredictionsType;
};

type TeamRow = MatchWithPredictionsType['home_team'] | null | undefined;

function TeamCrest({ team }: { team: TeamRow }) {
  if (!team) {
    return <View className="rounded-full bg-white/10" style={{ width: LOGO_SIZE, height: LOGO_SIZE }} />;
  }
  const logo = team.logo?.trim();
  if (logo?.length) {
    return (
      <ExpoImage
        source={logo}
        style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }}
        cachePolicy="memory-disk"
        contentFit="contain"
      />
    );
  }
  return (
    <View className="overflow-hidden rounded-full" style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>
      <TeamBadge teamId={team.id} name={team.name} shortName={team.shortName} tla={team.tla} size={LOGO_SIZE} />
    </View>
  );
}

function ScoreBlock({
  isFinished,
  isLive,
  isScheduled,
  homeScore,
  awayScore,
  kickOff,
}: {
  isFinished: boolean;
  isLive: boolean;
  isScheduled: boolean;
  homeScore: number | null;
  awayScore: number | null;
  kickOff: string;
}) {
  const { t } = useTranslation();

  if (isFinished) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px]">
        <CText variant="h3" bold className="text-white tracking-tight">
          {homeScore != null && awayScore != null ? `${homeScore} - ${awayScore}` : '—'}
        </CText>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px] gap-1">
        <CText variant="small" bold className="text-emerald-400">
          {t('Live')}
        </CText>
        <CText variant="h3" bold className="text-white">
          {`${homeScore ?? 0} - ${awayScore ?? 0}`}
        </CText>
      </View>
    );
  }

  if (isScheduled) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px]">
        <CText variant="h3" bold className="text-white">
          {formatTime(kickOff)}
        </CText>
      </View>
    );
  }

  return (
    <View className="px-2 min-w-[72px] items-center">
      <CText variant="h3" className="text-white/80">
        —
      </CText>
    </View>
  );
}

function StatusSlot({ isFinished }: { isFinished: boolean }) {
  const { t } = useTranslation();
  if (!isFinished) return null;
  return (
    <View className="rounded-full px-3 py-0.5" style={{ backgroundColor: CARD.badgeBg }}>
      <CText variant="small" bold className="text-white">
        {t('Finished')}
      </CText>
    </View>
  );
}

function TeamName({ name }: { name: string }) {
  return (
    <CText variant="bodyBold" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85} className="text-center">
      {name}
    </CText>
  );
}

export default memo(function Match({ match }: Props) {
  const matchStatus = getMatchStatus(match.status);
  const isFinished = isMatchFinished(matchStatus);
  const isLive = isMatchLive(matchStatus);
  const isScheduled = isMatchScheduled(matchStatus);

  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;

  const homeName = match.home_team?.name ?? '—';
  const awayName = match.away_team?.name ?? '—';
  const accessibilityLabel = `${homeName}, ${homeScore}-${awayScore}, ${awayName}`;

  return (
    <View className="mb-2">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          className=" rounded-2xl overflow-hidden border "
          style={{ backgroundColor: CARD.bg, borderColor: CARD.border }}
        >
          <StatusSlot isFinished={isFinished} />
          <View className="flex-1 flex-row items-center">
            <View className="flex-1 flex-row items-center gap-2 min-w-0 justify-end">
              <TeamName name={homeName} />
              <TeamCrest team={match.home_team} />
            </View>

            <ScoreBlock
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
              kickOff={match.kick_off}
            />

            <View className="flex-1 flex-row items-center gap-2 min-w-0 justify-start">
              <TeamCrest team={match.away_team} />
              <TeamName name={awayName} />
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
});
