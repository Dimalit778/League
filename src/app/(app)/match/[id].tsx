import { Error } from '@/components/layout';
import MatchHeader from '@/components/matchDetails/MatchHeader';
import SkeletonMatchDetails from '@/components/matchDetails/SkeletonMatchDetails';
import { useMatchContent } from '@/hooks/useMatchContent';
import { themes } from '@/lib/nativewind/themes';
import { useThemeStore } from '@/store/ThemeStore';
import { MatchesWithTeamsAndPredictionsType } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function MatchDetails() {
  const params = useLocalSearchParams();
  const { id, match: matchParam } = params;
  const theme = useThemeStore((state) => state.theme);

  let match: MatchesWithTeamsAndPredictionsType | null = null;
  try {
    if (matchParam) {
      match = JSON.parse(
        matchParam as string
      ) as MatchesWithTeamsAndPredictionsType;
    }
  } catch (e) {
    return <Error error={e as Error} />;
  }

  if (!match) return <SkeletonMatchDetails />;

  // Check if match is valid before using it
  const isValidMatch = match && !('error' in match);
  const Content = isValidMatch
    ? useMatchContent(match as MatchesWithTeamsAndPredictionsType)
    : null;

  return (
    <View style={[themes[theme]]} className="flex-1 bg-background">
      {isValidMatch && (
        <MatchHeader match={match as MatchesWithTeamsAndPredictionsType} />
      )}

      {Content}
    </View>
  );
}
