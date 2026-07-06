import { CText } from '@/components/ui/CText';
import { MatchCardType } from '@/features/matches/types';
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
          <CText className="text-muted">{dateLabel}</CText>
          <CText className="text-muted">{timeLabel}</CText>
        </View>

        {match.home_team?.logo && (
          <Image source={{ uri: match.home_team.logo }} className="w-8 h-6" contentFit="contain" />
        )}
        <CText className="text-white ml-2 flex-1" numberOfLines={1}>
          {match.home_team?.shortName ?? match.home_team?.name}
        </CText>

        <CText className="text-muted mx-3">VS</CText>

        {match.away_team?.logo && (
          <Image source={{ uri: match.away_team.logo }} className="w-8 h-6" contentFit="contain" />
        )}
        <CText className="text-white ml-2 flex-1" numberOfLines={1}>
          {match.away_team?.shortName ?? match.away_team?.name}
        </CText>

        <ChevronRight size={20} color="#8A94A6" />
      </Pressable>
    </Link>
  );
}

export function UpcomingMatchesCard({ matches }: { matches: MatchCardType[] }) {
  const { t } = useTranslation();

  return (
    <View className="rounded-3xl border border-cardBorder bg-card p-4">
      <View className="flex-row justify-between items-center mb-3">
        <CText className="text-white text-lg font-bold">{t('Today matches')}</CText>

        <Link href="/(app)/(league)/(tabs)/Matches" asChild>
          <Pressable className="flex-row items-center" accessibilityRole="button">
            <CText className="text-primaryGold">{t('View all')}</CText>
            <ChevronRight size={18} color="#D99A00" />
          </Pressable>
        </Link>
      </View>

      {matches.length === 0 ? (
        <CText className="text-muted py-3">{t('No matches today')}</CText>
      ) : (
        matches.map((match) => <Row key={match.id} match={match} />)
      )}
    </View>
  );
}
