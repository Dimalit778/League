import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const MatchNotStarted = ({
  isNotStarted,
  match,
  homeScorePrediction,
  setHomeScorePrediction,
  awayScorePrediction,
  setAwayScorePrediction,
  predictionSaved,
  savePrediction,
  handleSavePrediction,
}: {
  isNotStarted: boolean;
  match: any;
  homeScorePrediction: string;
  setHomeScorePrediction: (value: string) => void;
  awayScorePrediction: string;
  setAwayScorePrediction: (value: string) => void;
  predictionSaved: boolean;
  savePrediction: any;
  handleSavePrediction: () => void;
}) => {
  return (
    <LinearGradient
      colors={["#6366F1", "#8B5CF6"]}
      className="rounded-2xl overflow-hidden"
    >
      <View className="p-6">
        <View className="flex-row items-center mb-6">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="trophy-outline" size={20} color="white" />
          </View>
          <Text className="text-white text-xl font-bold ml-3">
            Make Your Prediction
          </Text>
        </View>

        {!predictionSaved ? (
          <View>
            <View className="flex-row items-center justify-center space-x-8 mb-8">
              {/* Home Prediction */}
              <View className="items-center">
                <Image
                  source={{ uri: match.home_team?.logo }}
                  className="w-12 h-12 mb-2"
                  resizeMode="contain"
                />
                <Text className="text-white text-sm font-bold mb-3">
                  {match.home_team?.name}
                </Text>
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
              <View className="items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                  <Text className="text-white font-bold">VS</Text>
                </View>
                <View className="w-16 h-1 bg-white/30 my-8" />
              </View>

              {/* Away Prediction */}
              <View className="items-center">
                <Image
                  source={{ uri: match.away_team?.logo }}
                  className="w-12 h-12 mb-2"
                  resizeMode="contain"
                />
                <Text className="text-white text-sm font-bold mb-3">
                  {match.away_team?.name}
                </Text>
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

            <TouchableOpacity
              onPress={handleSavePrediction}
              // disabled={
              //   !homeScorePrediction ||
              //   !awayScorePrediction ||
              //   savePrediction.isPending
              // }
              className="bg-white/20 rounded-xl py-4 px-6 items-center disabled:opacity-50"
            >
              <View className="flex-row items-center">
                {savePrediction.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="trophy" size={20} color="white" />
                )}
                <Text className="text-white font-bold text-lg ml-2">
                  {savePrediction.isPending
                    ? "Saving..."
                    : "Save My Prediction"}
                </Text>
              </View>
            </TouchableOpacity>
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
    </LinearGradient>
  );
};
