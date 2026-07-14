import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MatchCardType } from '@/features/matches/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function Row({ match }: { match: MatchCardType }) {
  const kickOff = new Date(match.kick_off);
  const dateLabel = kickOff.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const timeLabel = kickOff.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <Link href={`/(app)/(league)/match/${match.id}`} asChild>
      <Pressable className="flex-row items-center py-3" accessibilityRole="button">
        <CalendarDays size={22} color="#8A94A6" />

        <View className="ml-3 w-16">
          <Text className="text-muted">{dateLabel}</Text>
          <Text className="text-muted">{timeLabel}</Text>
        </View>

        {match.home_team?.logo && (
          <Image source={{ uri: match.home_team.logo }} className="w-8 h-6" contentFit="contain" />
        )}
        <Text className="text-white ml-2 flex-1" numberOfLines={1}>
          {match.home_team?.shortName ?? match.home_team?.name}
        </Text>

        <Text className="text-muted mx-3">VS</Text>

        {match.away_team?.logo && (
          <Image source={{ uri: match.away_team.logo }} className="w-8 h-6" contentFit="contain" />
        )}
        <Text className="text-white ml-2 flex-1" numberOfLines={1}>
          {match.away_team?.shortName ?? match.away_team?.name}
        </Text>

        <ChevronRight size={20} color="#8A94A6" />
      </Pressable>
    </Link>
  );
}

export function UpcomingMatches({ matches }: { matches: MatchCardType[] }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  return (
    <Card>
      <View className="flex-row justify-between items-center mb-3">
        <Text bold>{t('Today matches')}</Text>

        <Link href="/(app)/(league)/(tabs)/Matches" asChild>
          <Pressable className="flex-row items-center" accessibilityRole="button">
            <Text caption className="text-muted">
              {t('View all')}
            </Text>
            <ChevronRight size={18} color={colors.muted} strokeWidth={1.5} />
          </Pressable>
        </Link>
      </View>
      <View className="h-0.5 w-full bg-border rounded-full " />

      {matches.length === 0 ? (
        <Text caption className="text-muted py-3">
          {t('No matches today')}
        </Text>
      ) : (
        matches.map((match) => <Row key={match.id} match={match} />)
      )}
    </Card>
  );
}
