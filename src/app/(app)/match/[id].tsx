import { MatchHeader } from '@/components/matchDetails/MatchHeader';
import MatchSkeleton from '@/components/matchDetails/MatchSkeleton';
import { useGetFixtureById } from '@/hooks/useFixtures';
import { useMatchContent } from '@/hooks/useMatchContent';
import { useThemeStore } from '@/store/ThemeStore';
import { themes } from '@/styles/themes';
import { FixturesWithTeamsType } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function MatchDetails() {
  const { id } = useLocalSearchParams();
  const { theme } = useThemeStore();

  const { data: match, isLoading, error } = useGetFixtureById(Number(id));

  if (isLoading) return <MatchSkeleton />;
  if (error) console.log('error', error);

  // Check if match is valid before using it
  const isValidMatch = match && !('error' in match);
  const Content = isValidMatch
    ? useMatchContent(match as FixturesWithTeamsType)
    : null;

  return (
    <View style={[themes[theme]]} className="flex-1 bg-background">
      {isValidMatch && <MatchHeader match={match as FixturesWithTeamsType} />}

      {Content}
    </View>
  );
}
