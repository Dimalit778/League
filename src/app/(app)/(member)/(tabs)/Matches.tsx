import { LoadingOverlay } from '@/components/layout';
import MatchList from '@/components/matches/MatchList';
import MatchdaysList from '@/components/matches/MatchdaysList';
import { useMemberStore } from '@/store/MemberStore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Matches = () => {
  const { member   } = useMemberStore();
  const competition = member?.league?.competition;

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
        <View className="mb-3">
          <MatchdaysList
            matchdays={matchdays}
            selectedMatchday={selectedMatchday}
            handleMatchdayPress={handleMatchdayPress}
          />
        </View>
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
