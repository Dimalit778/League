import { CText } from '@/components/ui';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

type TodayMatchesProps = {
  matches: MatchCardData[] | undefined;
  isLoadingMatches: boolean;
};

export default function TodayMatches({ matches, isLoadingMatches }: TodayMatchesProps) {
  const { t } = useTranslation();

  return (
    <View className="px-2 mt-2">
      <CText variant="bodyBold" className="mb-2 px-1">
        {t("Today's Matches")}
      </CText>
      {matches?.map((match) => (
        <MatchCard
          key={match.id}
          id={match.id}
          home={match.home}
          away={match.away}
          prediction={match.prediction}
          predictionStatus={match.predictionStatus}
          date={match.date}
          time={match.time}
        />
      ))}
    </View>
  );
}
