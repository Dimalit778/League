import { Text, View } from "react-native";

export default function MatchDetails() {
  return (
    <View>
      <Text>[id]</Text>
    </View>
  );
}
// export default function MatchDetails() {
//   const { id } = useLocalSearchParams();
//   const fixtureId = Number(id);

//   const { data: match, isLoading, error } = useGetFixtureById(fixtureId);

//   const prediction = usePredictionManager({ fixtureId });

//   // Enable auto-predictions
//   useAutoPredictions();

//   if (isLoading) {
//     return (
//       <View className="flex-1 bg-background justify-center items-center">
//         <ActivityIndicator size="large" color="#6366F1" />
//         <Text className="text-text mt-4 text-lg">Loading match details...</Text>
//       </View>
//     );
//   }

//   if (error || !match) {
//     return (
//       <View className="flex-1 bg-background justify-center items-center px-4">
//         <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
//         <Text className="text-text text-xl font-bold mt-4 text-center">
//           Failed to load match details
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-background">
//       <MatchInfoHeader match={match} />
//       <ScrollView
//         className="flex-1 bg-background"
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="mx-4 mt-4">
//           <MatchInfoContent match={match} prediction={prediction} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
