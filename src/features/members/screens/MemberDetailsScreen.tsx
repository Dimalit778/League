import { Error, Screen } from '@/components/layout';
import { AvatarImage, BackButton, Card, CText } from '@/components/ui';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import MatchesList from '@/features/matches/components/matches/MatchesList';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { useGetMemberFinishedMatches } from '@/features/matches/hooks/useMatches';
import { useMemberDataAndStats } from '@/features/members/hooks/useMembers';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import MemberDetailsSkeleton from '../components/MemberDetailsSkeleton';
import MemberStats from '../components/memberStats';
const MemberDetailsScreen = ({ memberId }: { memberId: string }) => {
  const { data, error, isLoading } = useMemberDataAndStats(memberId);
  const { member, stats, totalFixtures = [], currentFixture = 1 } = data ?? {};
  const competitionId = member?.league?.competition?.id ?? 0;

  const {
    data: allFinishedMatches,
    isLoading: matchesLoading,
    error: matchesError,
  } = useGetMemberFinishedMatches(memberId, competitionId);

  const fixturesWithFinishedMatches = useMemo(() => {
    if (!allFinishedMatches) return [];
    const fixtureSet = new Set(
      allFinishedMatches.map((match) => match.fixture).filter((f): f is number => f !== null && f !== undefined)
    );
    return Array.from(fixtureSet).sort((a, b) => a - b);
  }, [allFinishedMatches]);

  const availableFixtures = useMemo(() => {
    if (fixturesWithFinishedMatches.length === 0) return totalFixtures;
    return totalFixtures.filter((fixture) => fixturesWithFinishedMatches.includes(fixture));
  }, [totalFixtures, fixturesWithFinishedMatches]);

  const initialFixture = useMemo(() => {
    if (fixturesWithFinishedMatches.length > 0) {
      return fixturesWithFinishedMatches[0];
    }
    return currentFixture;
  }, [fixturesWithFinishedMatches, currentFixture]);

  const [selectedFixture, setSelectedFixture] = useState<number>(initialFixture);
  const [animateScroll, setAnimateScroll] = useState(false);

  useEffect(() => {
    if (availableFixtures.length > 0 && !availableFixtures.includes(selectedFixture)) {
      setSelectedFixture(availableFixtures[0]);
    }
  }, [availableFixtures, selectedFixture]);

  const handleFixturePress = (fixture: number) => {
    setSelectedFixture(fixture);
    setAnimateScroll(true);
  };

  const matches = useMemo(() => {
    if (!allFinishedMatches) return [];
    return allFinishedMatches.filter((match) => match.fixture === selectedFixture);
  }, [allFinishedMatches, selectedFixture]);

  if (error || matchesError) return <Error error={error || (matchesError as Error)} />;

  return (
    <Screen withSafeArea>
      <BackButton />

      {isLoading ? (
        <MemberDetailsSkeleton />
      ) : (
        <>
          <Card className="px-3 py-1.5">
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
                <AvatarImage nickname={member?.nickname ?? ''} path={member?.avatar_url || null} />
              </View>

              <View className="flex-1">
                <CText variant="body" bold numberOfLines={1}>
                  {member?.nickname}
                </CText>
              </View>
              <View className="flex-row items-center gap-4">
                <View className="items-end">
                  <CText variant="caption" className="text-muted uppercase">
                    Points
                  </CText>
                  <CText variant="body" bold>
                    {stats?.totalPoints.toLocaleString() ?? 0}
                  </CText>
                </View>
                <View className="h-6 w-px bg-border" />
                <View className="items-end">
                  <CText variant="caption" className="text-muted uppercase">
                    Position
                  </CText>
                  <CText variant="body" bold>
                    {stats?.position ?? '—'}
                  </CText>
                </View>
              </View>
            </View>
          </Card>

          <MemberStats stats={stats} />
          <View className="py-1">
            <FixturesList
              fixtures={availableFixtures}
              selectedFixture={selectedFixture}
              handleFixturePress={handleFixturePress}
              animateScroll={animateScroll}
              fixtureDateRanges={[]}
            />
          </View>
          <ScrollView className="flex-1 mt-2" showsVerticalScrollIndicator={false}>
            {matchesLoading ? <SkeletonMatches /> : <MatchesList matches={matches} />}
          </ScrollView>
        </>
      )}
    </Screen>
  );
};

export default MemberDetailsScreen;
