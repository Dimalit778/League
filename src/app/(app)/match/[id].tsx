import MatchHeader from '@/components/matchDetails/MatchHeader';
import SkeletonMatchDetails from '@/components/matchDetails/SkeletonMatchDetails';
import { useMatchContent } from '@/hooks/useMatchContent';
import { themes } from '@/lib/nativewind/themes';
import { useThemeStore } from '@/store/ThemeStore';
import { FixturesWithTeamsType } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function MatchDetails() {
  const params = useLocalSearchParams();
  const { id, match: matchParam } = params;
  const theme = useThemeStore((state) => state.theme);

  let match: FixturesWithTeamsType | null = null;
  try {
    if (matchParam) {
      match = JSON.parse(matchParam as string) as FixturesWithTeamsType;
    }
  } catch (e) {
    console.log('Error parsing match from params:', e);
  }

  if (!match) return <SkeletonMatchDetails />;

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
