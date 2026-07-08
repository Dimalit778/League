import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { Image as ExpoImage } from 'expo-image';
import { View } from 'react-native';
import { WCMatch } from '../types';

const LOGO_SIZE = 32;

type Props = {
  match: WCMatch;
  layout?: 'grid' | 'row';
};

const TeamSide = ({ team }: { team: WCMatch['home_team'] }) => (
  <View className="flex-1 items-center">
    <ExpoImage
      source={team.logo}
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 4 }}
      cachePolicy="memory-disk"
      contentFit="contain"
    />
    <Text variant="caption" className="text-center mt-2">
      {team.tla}
    </Text>
  </View>
);

const Score = ({ home, away, finished }: { home: number | null; away: number | null; finished: boolean }) => {
  if (!finished) {
    return (
      <View className="items-center justify-center px-3">
        <Text variant="h3" className="text-muted">
          –
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center px-2">
      <Text variant="h3" className="text-text">
        {home}
      </Text>
      <View className="w-0.5 h-full bg-border mx-3" />
      <Text variant="h3" className="text-text">
        {away}
      </Text>
    </View>
  );
};

export default function WCMatchCard({ match, layout = 'grid' }: Props) {
  const { colors } = useThemeTokens();
  const { t, language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const dateStr = formatMatchdayDate(match.kick_off, locale);
  const timeStr = formatTime(match.kick_off);
  const finished = match.status === 'FINISHED';
  const prediction = match.user_prediction;
  const points = prediction?.points;
  const accentColor = points != null && points > 0 ? colors.success : points === 0 ? colors.error : colors.surface;

  return (
    <View className={cn(layout === 'grid' ? 'w-1/2' : 'w-full')}>
      <View
        className="m-1.5 rounded-md border bg-surface/40"
        style={{ borderColor: prediction ? accentColor : colors.surface }}
      >
        <View className="flex-row items-center justify-between p-1 px-2">
          <Text variant="caption" className={finished ? 'text-muted' : 'text-text'}>
            {dateStr}
          </Text>
          <Text variant="caption" className={finished ? 'text-muted' : 'text-text'}>
            {finished ? t('FT') : timeStr}
          </Text>
        </View>

        <View className="flex-row py-3">
          <TeamSide team={match.home_team} />
          <Score home={match.home_score} away={match.away_score} finished={finished} />
          <TeamSide team={match.away_team} />
        </View>

        <View className="bg-surface justify-center border-t border-border rounded-b-md min-h-[20px] px-2 py-1">
          <View className="flex-row items-center justify-between">
            <Text variant="caption" className="text-muted">
              {prediction ? `${prediction.home} - ${prediction.away}` : finished ? t('No prediction') : t('Predict')}
            </Text>
            {prediction && finished && points != null && (
              <Text variant="caption" bold style={{ color: accentColor }}>
                {points} {t('pts')}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
