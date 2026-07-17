import { useFloatBottomTabsInset } from '@/components/layout';
import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { mapMatchToCardData } from '../../utils/matchCard.mapper';
import { computeLeagueStandings, getLeagueFixtures, getMatchesByFixture } from '../../utils/tournamentMatches';
import MatchesList from '../regular-league/MatchesList';
import { HorizontalTabs } from '../tournament/TournametTabs';
import LeagueStandingsTable from './LeagueStandingsTable';

type ChampionLeagueViewProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

export default function ChampionLeagueView({ matches, onRefresh }: ChampionLeagueViewProps) {
  const { t } = useTranslation();
  const bottomTabsInset = useFloatBottomTabsInset();
  const [showStandings, setShowStandings] = useState(false);

  const fixtures = useMemo(() => getLeagueFixtures(matches), [matches]);
  const [selectedFixture, setSelectedFixture] = useState<number>(fixtures[fixtures.length - 1] ?? 1);

  const standings = useMemo(() => computeLeagueStandings(matches), [matches]);

  const fixtureMatches = useMemo(() => getMatchesByFixture(matches, selectedFixture), [matches, selectedFixture]);
  const fixtureMatchCards = useMemo(() => fixtureMatches.map(mapMatchToCardData), [fixtureMatches]);

  const fixtureOptions = fixtures.map((f) => ({
    value: String(f),
    label: String(f),
  }));

  return (
    <View className="flex-1">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => setShowStandings(true)}
          className="ml-3 rounded-lg border border-border bg-surface px-3 py-1.5"
        >
          <Text semibold className="text-text">
            {t('Standings')}
          </Text>
        </Pressable>
        <View className="flex-1">
          <HorizontalTabs
            options={fixtureOptions}
            value={String(selectedFixture)}
            onChange={(val) => setSelectedFixture(Number(val))}
          />
        </View>
      </View>

      <MatchesList matches={fixtureMatchCards} onRefresh={onRefresh} bottomInset={bottomTabsInset} />

      {/* Standings modal */}
      <Modal visible={showStandings} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
            <Text variant="h3" bold className="text-text">
              {t('Standings')}
            </Text>
            <Pressable onPress={() => setShowStandings(false)} className="px-2 py-1">
              <Text variant="body" className="text-primary">
                {t('Close')}
              </Text>
            </Pressable>
          </View>
          <LeagueStandingsTable rows={standings} />
        </View>
      </Modal>
    </View>
  );
}
