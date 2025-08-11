import { SafeAreaView, ScrollView, View } from "react-native";
import { MatchInfoCard } from "./MatchInfoCard";
import { MatchStatusRenderer } from "./MatchStatusRenderer";
import { PredictionActions, PredictionState } from "./PredictionManager";

interface MatchDetailsContentProps {
  match: any;
  prediction: PredictionState & PredictionActions;
}

export const MatchDetailsContent = ({
  match,
  prediction,
}: MatchDetailsContentProps) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <MatchInfoCard match={match} />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-4">
          <MatchStatusRenderer match={match} prediction={prediction} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};