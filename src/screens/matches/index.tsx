import { useMemberStore } from '@/store/MemberStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import MatchdaysList from './MatchdaysList';
import MatchdaysListSkeleton from './MatchdaysListSkeleton';
import MatchList from './MatchList';
import MatchesSkeleton from './SkeletonMatches';

const Matches = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;
  const competition = member?.league?.competition;
  const currentMatchday = competition?.current_matchday as number;
  const totalMatchdays = competition?.total_matchdays as number;

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

  if (!matchdays.length || selectedMatchday == null) {
    return (
      <View className="flex-1 bg-background">
        <MatchdaysListSkeleton />
        <MatchesSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <MatchdaysList
        matchdays={matchdays ?? []}
        selectedMatchday={selectedMatchday ?? 1}
        handleMatchdayPress={handleMatchdayPress}
        animateScroll={animateScroll}
      />

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
