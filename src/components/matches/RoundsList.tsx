import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type RoundsListProps = {
  rounds: string[];
  selectedRound: string;
  handleRoundPress: (round: string) => void;
};
export default function RoundsList({
  rounds,
  selectedRound,
  handleRoundPress,
}: RoundsListProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <View className="flex-row justify-center items-center">
        <Text className="text-gray-400 p-4">No rounds available</Text>
      </View>
    );
  }

  return (
    <View className="my-3 mx-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {rounds.map((round, index) => {
          const getRoundNumber = (roundName: string): string => {
            const match = roundName.match(/(\d+)$/);
            return match ? match[1] : (index + 1).toString();
          };

          return (
            <TouchableOpacity
              key={round}
              onPress={() => handleRoundPress(round)}
              className={`mx-1 rounded-full border-1 border-border ${
                selectedRound === round ? 'bg-primary' : 'bg-surface'
              }`}
              style={{
                height: 55,
                width: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                className={`text-text font-semibold ${
                  selectedRound === round ? 'text-background' : 'text-text'
                }`}
              >
                {getRoundNumber(round)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
