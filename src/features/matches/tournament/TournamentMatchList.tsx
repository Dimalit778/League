import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';
import { View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { groupMatchesByFixture } from '../../utils/tournamentMatches';
import MatchesCard from '../regular-league/MatchesCard';

type TournamentMatchListProps = {
  view: 'groups' | 'knockout';
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

const EmptyMatches = () => {
  const { t } = useTranslation();
  return <CText className="text-text text-center mt-6">{t('No matches found')}</CText>;
};

export default function TournamentMatchList({ view, matches, onRefresh }: TournamentMatchListProps) {
  const { t } = useTranslation();
  const groupSections = useMemo(() => groupMatchesByFixture(matches), [matches]);

  if (matches.length === 0) return <EmptyMatches />;

  if (view === 'groups') {
    return (
      <>
        {groupSections.map((section) => (
          <View key={section.fixture} className="mx-2 mt-3">
            <View className="px-2 mb-1">
              <CText variant="caption" bold className="text-muted">
                {t('Matchday')} {section.fixture}
              </CText>
            </View>
            <View className="flex-row flex-wrap">
              {section.matches.map((match) => (
                <MatchesCard key={match.id} match={match} />
              ))}
            </View>
          </View>
        ))}
      </>
    );
  }

  return (
    <View className="flex-row flex-wrap px-2 mt-2">
      {matches.map((match) => (
        <MatchesCard key={match.id} match={match} />
      ))}
    </View>
  );
}
