// import TeamDisplay from '../../match/TeamDisplay';
// import { Card } from '@/components/ui';
// import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
// import { MatchWithPredictionsType, PredictionType, ScoreType } from '@/types';
// import { LinearGradient } from 'expo-linear-gradient';

// import { Text, View } from 'react-native';

// const COMPACT_TEAM_LOGO_SIZE = 32;

// function getMatchStatusColor(prediction: PredictionType | null, mutedColor: string): [string, string] {
//   if (prediction && prediction.points !== undefined) {
//     const points = prediction.points;
//     if (points === 5) {
//       return ['#FCD34D', '#F59E0B'];
//     }
//     if (points === 3) {
//       return ['#10B981', '#059669'];
//     }
//     if (points === 0) {
//       return ['#6B7280', '#EF4444'];
//     }
//     return [mutedColor, mutedColor];
//   }

//   return [mutedColor, mutedColor];
// }

// function MatchScoreDisplay({
//   matchScore,
//   prediction,
//   gradientColors,
// }: {
//   matchScore: ScoreType | null;
//   prediction: PredictionType | null;
//   gradientColors: [string, string];
// }) {
//   const homeScore = matchScore?.fullTime?.home ?? 0;
//   const awayScore = matchScore?.fullTime?.away ?? 0;
//   const predictionHome = prediction?.home_score ?? null;
//   const predictionAway = prediction?.away_score ?? null;

//   return (
//     <View className="flex-1 items-center justify-center gap-1">
//       {prediction ? (
//         <LinearGradient colors={gradientColors} className="rounded-lg px-2 py-0.5">
//           <View className="flex-row items-center justify-center gap-1 px-2">
//             <Text className="text-background text-sm font-bold">{predictionHome}</Text>
//             <Text className="text-background text-sm font-bold">:</Text>
//             <Text className="text-background text-sm font-bold">{predictionAway}</Text>
//           </View>
//         </LinearGradient>
//       ) : (
//         <Text className="text-muted text-xs font-medium">No prediction</Text>
//       )}

//       {/* Actual Score */}
//       <View className="flex-row items-center justify-center gap-1.5">
//         <Text className="text-muted text-lg font-semibold">{homeScore}</Text>
//         <Text className="text-muted text-lg">:</Text>
//         <Text className="text-muted text-lg font-semibold">{awayScore}</Text>
//       </View>
//     </View>
//   );
// }

// export default function FinishedMatchCard({ match }: { match: MatchWithPredictionsType }) {
//   const { colors } = useThemeTokens();
//   const prediction = match.predictions?.[0] ?? null;
//   const gradientColors = getMatchStatusColor(prediction, colors.muted);

//   return (
//     <Card className="mx-2 my-1">
//       <View className="flex-row justify-between items-center py-2.5 px-2">
//         <TeamDisplay team={match.home_team} logoSize={COMPACT_TEAM_LOGO_SIZE} textSize="xs" marginBottom="sm" />

//         <View className="min-w-[60px] max-w-[80px]">
//           <MatchScoreDisplay matchScore={match.score} prediction={prediction} gradientColors={gradientColors} />
//         </View>

//         <TeamDisplay team={match.away_team} logoSize={COMPACT_TEAM_LOGO_SIZE} textSize="xs" marginBottom="sm" />
//       </View>
//     </Card>
//   );
// }
