// import { Text, LogoBadge } from '@/components/ui';
// import { useThemeTokens } from '@/hooks/useThemeTokens';
// import { useTranslation } from '@/hooks/useTranslation';
// import { cn } from '@/lib/nativeWind';
// import { formatMatchdayDate, formatTime } from '@/utils/formats';
// import { AddIcon } from '@assets/icons';
// import { View } from 'react-native';
// import { MatchWithPredictionsType, PredictionType } from '../../types';
// import { getPredictionResultLabel } from '../../utils/pointsColor';
// type ScoreDisplayProps = {
//   isFinished: boolean;
//   isLive: boolean;
//   isScheduled: boolean;
//   homeScore?: number | null;
//   awayScore?: number | null;
// };
// type TeamDisplayProps = {
//   team: MatchWithPredictionsType['home_team'];
//   isDesktop: boolean;
// };
// type MatchCardHeaderProps = {
//   kickOff: string;
//   isScheduled: boolean;
//   isLive: boolean;
//   isFinished: boolean;
// };
// type PredictionDisplayProps = {
//   prediction: PredictionType | null;
//   isFinished: boolean;
// };
// export const PredictionDisplay = ({ prediction, isFinished }: PredictionDisplayProps) => {
//   const { t } = useTranslation();
//   const points = prediction?.points ?? 0;
//   const isPredictionFinished = prediction?.is_finished ?? false;
//   const predictionScore =
//     prediction?.home_score !== null &&
//     prediction?.away_score !== null &&
//     prediction?.home_score !== undefined &&
//     prediction?.away_score !== undefined
//       ? `${prediction.home_score} - ${prediction.away_score}`
//       : null;
//   const predictionResult = getPredictionResultLabel(prediction?.points, isPredictionFinished, isFinished);
//   const predictionResultTitle = predictionResult?.title ?? '';
//   return (
//     <View className="flex-row items-center justify-between  border-t border-border p-1">
//       {isPredictionFinished && isFinished && (
//         <View className="w-1/3 flex-row items-center">
//           <Text variant="caption" className="text-text" style={{ color: predictionResult?.color }}>
//             {t(predictionResultTitle)}
//           </Text>
//         </View>
//       )}

//       <View className="flex-1 items-center">
//         {isFinished && !predictionScore ? (
//           <Text variant="caption" className="text-muted ">
//             {t('No prediction')}
//           </Text>
//         ) : (
//           <Text variant="caption" className="text-text ">
//             {predictionScore}
//           </Text>
//         )}
//       </View>

//       {isPredictionFinished && isFinished && points != null && (
//         <View className="w-1/3 flex-row items-center justify-end">
//           <Text variant="caption" className="text-text" style={{ color: predictionResult?.color }}>
//             {points} {t('pts')}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export const MatchCardHeader = ({ kickOff, isScheduled, isLive, isFinished }: MatchCardHeaderProps) => {
//   const { t, language } = useTranslation();
//   const locale = language === 'he' ? 'he-IL' : 'en-GB';
//   const dateStr = formatMatchdayDate(kickOff, locale);
//   const kickOffTime = formatTime(kickOff);

//   return (
//     <View className="flex-row items-center justify-between p-1 px-2 border-b border-border   ">
//       <Text variant="caption" className={isScheduled ? 'text-text' : 'text-muted'}>
//         {dateStr}
//       </Text>
//       <Text variant="caption" className={cn(isLive ? 'text-success ' : isFinished ? 'text-muted ' : 'text-text ')}>
//         {isScheduled ? kickOffTime : isLive ? t('Live') : isFinished ? t('FT') : null}
//       </Text>
//     </View>
//   );
// };
// export const TeamDisplay = ({ team, isDesktop }: TeamDisplayProps) => {
//   return (
//     <View className="flex-1  items-center ">
//       <LogoBadge source={{ uri: team.logo }} width={50} height={50} />
//       <Text variant="caption" className="text-center mt-2">
//         {isDesktop ? team.shortName || team.name : team.shortName || team.name || team.tla}
//       </Text>
//     </View>
//   );
// };

// export const ScoreDisplay = ({ isFinished, isLive, isScheduled, homeScore, awayScore }: ScoreDisplayProps) => {
//   const { colors } = useThemeTokens();

//   if (isFinished) {
//     return (
//       <View className="flex-row items-center">
//         <Text variant="h3" className="text-muted ">
//           {homeScore}
//         </Text>
//         <View className="w-0.5 h-full bg-border mx-3" />
//         <Text variant="h3" className="text-muted ">
//           {awayScore}
//         </Text>
//       </View>
//     );
//   }

//   if (isLive) {
//     return (
//       <View className="items-center ">
//         <View className="w-1.5 h-1.5 rounded-full bg-success" />
//         <View className="flex-row items-center justify-center gap-1 mt-1">
//           <Text variant="h3" className="text-text ">
//             {homeScore}
//           </Text>
//           <Text variant="h3" className="text-text ">
//             :
//           </Text>
//           <Text variant="h3" className="text-text ">
//             {awayScore}
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   if (isScheduled) {
//     return (
//       <View className=" items-center justify-center ">
//         <AddIcon size={24} color={colors.text} />
//       </View>
//     );
//   }

//   return null;
// };
