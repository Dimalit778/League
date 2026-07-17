import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';
import { View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { mapMatchToCardProps } from '../../utils/matchCard.mapper';
import { groupMatchesByFixture } from '../../utils/tournamentMatches';
import { MatchCard } from '../MatchCard';

type TournamentMatchListProps = {
  view: 'groups' | 'knockout';
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

export default function TournamentMatchList({
  view,
  matches,
  onRefresh,
}: TournamentMatchListProps) {
  const { t } = useTranslation();
  const groupSections = useMemo(
    () => groupMatchesByFixture(matches),
    [matches],
  );
  // group matches
  if (view === 'groups') {
    return (
      <>
        {groupSections.map((section) => (
          <View key={section.fixture} className="mx-2 mt-3">
            <View className="px-2 mb-1">
              <Text variant="caption" bold className="text-muted">
                {t('Matchday')} {section.fixture}
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {section.matches.map((match) => {
                const card = mapMatchToCardProps(match);

                return (
                  <MatchCard
                    key={match.id}
                    id={card.id}
                    home={card.home}
                    away={card.away}
                    prediction={card.prediction}
                    predictionStatus={card.predictionStatus}
                    status={card.status}
                    logoVariant="flag"
                    date={card.date}
                    time={card.time}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </>
    );
  }

  // knockout matches
  return (
    <View className="flex-row flex-wrap px-2 mt-2">
      {matches.map((match) => {
        const card = mapMatchToCardProps(match);

        return (
          <MatchCard
            key={match.id}
            id={card.id}
            home={card.home}
            away={card.away}
            prediction={card.prediction}
            predictionStatus={card.predictionStatus}
            status={card.status}
            logoVariant="flag"
            date={card.date}
            time={card.time}
          />
        );
      })}
    </View>
  );
}
