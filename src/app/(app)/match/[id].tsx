import { MatchHeader } from '@/components/matchDetails/MatchHeader';
import MatchSkeleton from '@/components/matchDetails/MatchSkeleton';
import { useMatchContent } from '@/hooks/useMatchContent';
import { useThemeStore } from '@/store/ThemeStore';
import { themes } from '@/styles/themes';
import { FixturesWithTeamsType } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function MatchDetails() {
  const params = useLocalSearchParams();
  const { id, match: matchParam } = params;
  const { theme } = useThemeStore();

  let match: FixturesWithTeamsType | null = null;
  try {
    if (matchParam) {
      match = JSON.parse(matchParam as string) as FixturesWithTeamsType;
    }
  } catch (e) {
    console.log('Error parsing match from params:', e);
  }

  if (!match) return <MatchSkeleton />;

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
