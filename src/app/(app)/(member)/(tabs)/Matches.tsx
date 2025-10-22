import MatchdaysList from '@/components/matches/MatchdaysList';
import MatchList from '@/components/matches/MatchList';
import { useMemberStore } from '@/store/MemberStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

const Matches = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;
  const competition = member?.league?.competition;

  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);
  const matchdays = useMemo(
    () =>
      competition?.total_matchdays
        ? Array.from({ length: competition.total_matchdays }, (_, i) => i + 1)
        : [],
    [competition?.total_matchdays]
  );

  useFocusEffect(
    useCallback(() => {
      if (competition?.current_matchday) {
        setAnimateScroll(false); // <- important: no animation on entry
        setSelectedMatchday(competition.current_matchday);
      }
      return () => {
        setSelectedMatchday(null); // unmount list while leaving
      };
    }, [competition?.current_matchday])
  );

  const handleMatchdayPress = useCallback((matchday: number) => {
    setAnimateScroll(true); // animate only on user tap
    setSelectedMatchday(matchday);
  }, []);

  return (
    <View className="flex-1 bg-background">
      {selectedMatchday && (
        <View className="mb-3 ">
          <MatchdaysList
            matchdays={matchdays}
            selectedMatchday={selectedMatchday}
            handleMatchdayPress={handleMatchdayPress}
            animateScroll={animateScroll}
          />
        </View>
      )}

      {selectedMatchday && competition && userId && (
        <MatchList
          selectedMatchday={selectedMatchday}
          competitionId={competition.id}
          userId={userId}
        />
      )}
    </View>
  );
};

export default Matches;
