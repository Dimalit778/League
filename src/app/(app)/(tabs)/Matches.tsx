import { LoadingOverlay } from '@/components/layout';
import MatchList from '@/components/matches/MatchList';
import MatchdaysList from '@/components/matches/MatchdaysList';
import { useMemberStore } from '@/store/MemberStore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';

const Matches = () => {
  const { member, league, competition } = useMemberStore();
  console.log('league', JSON.stringify(league, null, 2));
  console.log('competition', JSON.stringify(competition, null, 2));
  console.log('member', JSON.stringify(member, null, 2));

  // const competition = member?.league?.competition;
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);

  const matchdays = useMemo(
    () =>
      competition?.total_matchdays
        ? Array.from({ length: competition.total_matchdays }, (_, i) => i + 1)
        : [],
    [competition?.total_matchdays]
  );

  useEffect(() => {
    if (competition?.current_matchday && !selectedMatchday) {
      setSelectedMatchday(competition.current_matchday);
    }
  }, [competition?.current_matchday, selectedMatchday]);

  const handleMatchdayPress = useCallback((matchday: number) => {
    setSelectedMatchday(matchday);
  }, []);

  const userId = member?.user_id;
  const showMatchList = !!selectedMatchday && !!competition && !!userId;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {competition && !selectedMatchday && <LoadingOverlay />}
      {selectedMatchday && (
        <MatchdaysList
          matchdays={matchdays}
          selectedMatchday={selectedMatchday}
          handleMatchdayPress={handleMatchdayPress}
        />
      )}

      {showMatchList && (
        <MatchList
          selectedMatchday={selectedMatchday}
          competitionId={competition.id}
          userId={userId}
        />
      )}
    </SafeAreaView>
  );
};

export default Matches;
