import { ButtonC } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

interface MatchNotStartedProps {
  homeScorePrediction: string;
  setHomeScorePrediction: (value: string) => void;
  awayScorePrediction: string;
  setAwayScorePrediction: (value: string) => void;
  predictionSaved: boolean;
  handleSavePrediction: () => void;
  canPredict: boolean;
  isSaving: boolean;
}

export const MatchNotStarted = ({
  homeScorePrediction,
  setHomeScorePrediction,
  awayScorePrediction,
  setAwayScorePrediction,
  predictionSaved,
  handleSavePrediction,
  canPredict,
  isSaving,
}: MatchNotStartedProps) => {
  return (
    <View className="p-6">
      <Text className="text-text text-xl font-semibold text-center mb-5">
        Make Your Prediction
      </Text>

      {!canPredict ? (
        <View className="items-center">
          <View className="bg-red-500/20 rounded-2xl p-6 items-center mb-4">
            <Ionicons name="time-outline" size={48} color="#EF4444" />
            <Text className="text-red-400 font-bold text-xl mt-2">
              Prediction Time Expired
            </Text>
            <Text className="text-text/80 text-center mt-2">
              The match is about to start. Predictions are no longer allowed.
            </Text>
          </View>
          {predictionSaved && (
            <View className="bg-white/10 rounded-xl p-4 mt-4">
              <Text className="text-text font-semibold text-center mb-2">
                Your Final Prediction:
              </Text>
              <Text className="text-text text-2xl font-bold text-center">
                {homeScorePrediction} - {awayScorePrediction}
              </Text>
            </View>
          )}
        </View>
      ) : !predictionSaved ? (
        <View className="flex-1">
          <View className="flex-row items-center justify-center mb-8">
            {/* Home Prediction */}
            <View className="items-center">
              <TextInput
                value={homeScorePrediction}
                onChangeText={setHomeScorePrediction}
                keyboardType="number-pad"
                maxLength={2}
                className="w-16 h-16 bg-white/20 rounded-xl text-center text-white text-2xl font-bold border border-white/30"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.5)"
                editable={canPredict}
              />
            </View>
            {/* VS */}
            <View className="items-center px-4">
              <Text className="text-white/60 text-lg font-bold">VS</Text>
            </View>
            {/* Away Prediction */}
            <View className="items-center">
              <TextInput
                value={awayScorePrediction}
                onChangeText={setAwayScorePrediction}
                keyboardType="number-pad"
                maxLength={2}
                className="w-16 h-16 bg-white/20 rounded-xl text-center text-white text-2xl font-bold border border-white/30"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.5)"
                editable={canPredict}
              />
            </View>
          </View>
          <View className="mt-10">
            <ButtonC
              title={isSaving ? "Saving..." : "Save Prediction"}
              onPress={handleSavePrediction}
              disabled={!canPredict || isSaving}
            />
          </View>
        </View>
      ) : (
        <View className="items-center">
          <View className="bg-white/20 rounded-2xl p-6 items-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="white" />
            <Text className="text-white font-bold text-xl mt-2">
              Prediction Saved!
            </Text>
            <Text className="text-white/90 text-2xl font-bold mt-2">
              {homeScorePrediction} - {awayScorePrediction}
            </Text>
          </View>
          <Text className="text-white/80 text-center">
            Good luck with your prediction! 🍀
          </Text>
        </View>
      )}
    </View>
  );
};
