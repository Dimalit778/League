import { CText } from '@/components/ui/CText';
import { MatchCardType } from '@/features/matches/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function Row({ match }: { match: MatchCardType }) {
  return (
    <Pressable className="flex-row items-center py-3">
      <CalendarDays size={22} color="#8A94A6" />

      <View className="ml-3 w-20">
        <CText className="text-muted">{match.dateLabel}</CText>
        <CText className="text-muted">{match.time}</CText>
      </View>

      <Image source={{ uri: match.homeTeam.flag }} className="w-8 h-6" />
      <CText className="text-white ml-2 flex-1">{match.homeTeam.name}</CText>

      <CText className="text-muted mx-3">VS</CText>

      <Image source={{ uri: match.awayTeam.flag }} className="w-8 h-6" />
      <CText className="text-white ml-2 flex-1">{match.awayTeam.name}</CText>

      <ChevronRight size={20} color="#8A94A6" />
    </Pressable>
  );
}
export function UpcomingMatchesCard({ matches }: { matches: Match[] }) {
  return (
    <View className="rounded-3xl border border-cardBorder bg-card p-4">
      <View className="flex-row justify-between items-center mb-3">
        <CText className="text-white text-lg font-bold">Upcoming this week</CText>

        <Link href="/matches" asChild>
          <Pressable className="flex-row items-center">
            <CText className="text-primaryGold">View all</CText>
            <ChevronRight size={18} color="#D99A00" />
          </Pressable>
        </Link>
      </View>

      {matches.map((match) => (
        <UpcomingMatchRow key={match.id} match={match} />
      ))}
    </View>
  );
}
