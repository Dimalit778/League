import { ButtonC } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export const MatchNotStarted = ({
  homeScorePrediction,
  setHomeScorePrediction,
  awayScorePrediction,
  setAwayScorePrediction,
  predictionSaved,
  savePrediction,
  handleSavePrediction,
}: {
  homeScorePrediction: string;
  setHomeScorePrediction: (value: string) => void;
  awayScorePrediction: string;
  setAwayScorePrediction: (value: string) => void;
  predictionSaved: boolean;
  savePrediction: any;
  handleSavePrediction: () => void;
}) => {
  return (
    <View className="p-6">
      <Text className="text-text text-xl font-semibold text-center mb-5">
        Make Your Prediction
      </Text>

      {!predictionSaved ? (
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
              />
            </View>
            {/* VS */}
            <View className="items-center px-4">
              {/* <View className="w-5 h-1 bg-white/30 my-8" /> */}
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
              />
            </View>
          </View>
          <View className="mt-10">
            <ButtonC title="Save Prediction" onPress={handleSavePrediction} />
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
