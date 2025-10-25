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
  const currentMatchday = (competition?.season as { current_matchday: number })
    ?.current_matchday;
  const totalMatchdays = (competition?.season as { total_matchdays: number })
    ?.total_matchdays;

  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);
  const matchdays = useMemo(
    () =>
      totalMatchdays
        ? Array.from({ length: totalMatchdays }, (_, i) => i + 1)
        : [],
    [totalMatchdays]
  );

  useFocusEffect(
    useCallback(() => {
      if (currentMatchday) {
        setAnimateScroll(false);
        setSelectedMatchday(currentMatchday);
      }
      return () => {
        setSelectedMatchday(null);
      };
    }, [currentMatchday])
  );

  const handleMatchdayPress = useCallback((matchday: number) => {
    setAnimateScroll(true);
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
