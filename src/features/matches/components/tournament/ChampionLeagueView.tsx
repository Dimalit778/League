import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { computeLeagueStandings, getLeagueFixtures, getMatchesByFixture } from '../../utils/tournamentMatches';
import LeagueStandingsTable from './LeagueStandingsTable';
import Match from './Match';
import { HorizontalTabs } from './TournametTabs';

type ChampionLeagueViewProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

export default function ChampionLeagueView({ matches, onRefresh }: ChampionLeagueViewProps) {
  const { t } = useTranslation();
  const [showStandings, setShowStandings] = useState(false);

  const fixtures = useMemo(() => getLeagueFixtures(matches), [matches]);
  const [selectedFixture, setSelectedFixture] = useState<number>(fixtures[fixtures.length - 1] ?? 1);

  const standings = useMemo(() => computeLeagueStandings(matches), [matches]);

  const fixtureMatches = useMemo(() => getMatchesByFixture(matches, selectedFixture), [matches, selectedFixture]);

  const fixtureOptions = fixtures.map((f) => ({
    value: String(f),
    label: String(f),
  }));

  return (
    <View className="flex-1">
      {/* Fixtures row + Standings button */}
      <View className="flex-row items-center">
        <Pressable
          onPress={() => setShowStandings(true)}
          className="ml-3 rounded-lg border border-border bg-surface px-3 py-1.5"
        >
          <CText variant="bodyBold" className="text-text">
            {t('Standings')}
          </CText>
        </Pressable>
        <View className="flex-1">
          <HorizontalTabs
            options={fixtureOptions}
            value={String(selectedFixture)}
            onChange={(val) => setSelectedFixture(Number(val))}
          />
        </View>
      </View>

      {/* Matches list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        {fixtureMatches.length > 0 ? (
          fixtureMatches.map((match) => <Match key={match.id} match={match} />)
        ) : (
          <CText className="text-muted text-center mt-6">{t('No matches found')}</CText>
        )}
      </ScrollView>

      {/* Standings modal */}
      <Modal visible={showStandings} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
            <CText variant="h3" bold className="text-text">
              {t('Standings')}
            </CText>
            <Pressable onPress={() => setShowStandings(false)} className="px-2 py-1">
              <CText variant="body" className="text-primary">
                {t('Close')}
              </CText>
            </Pressable>
          </View>
          <LeagueStandingsTable rows={standings} />
        </View>
      </Modal>
    </View>
  );
}
