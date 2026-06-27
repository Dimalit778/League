import { CText } from '@/components/ui';
import { MatchType } from '@/features/matches/types';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
type MatchCardProps = {
  match: MatchType;
};
type TodayMatchesProps = {
  matches: MatchType[] | undefined;
  isLoadingMatches: boolean;
};
function MatchCard({ match }: MatchCardProps) {
  return (
    <View className="px-2 mt-2">
      <CText variant="bodyBold" className="mb-2 px-1">
        {match.home_team.name} vs {match.away_team.name}
      </CText>
    </View>
  );
}

export default function TodayMatches({ matches, isLoadingMatches }: TodayMatchesProps) {
  const { t } = useTranslation();

  return (
    <View className="px-2 mt-2">
      <CText variant="bodyBold" className="mb-2 px-1">
        {t("Today's Matches")}
      </CText>
      {matches?.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </View>
  );
}
