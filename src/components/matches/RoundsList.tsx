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
            className={`mx-2 px-4 py-2 rounded-full ${
              selectedRound === round ? 'bg-primary' : 'bg-surface'
            }`}
            style={{
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="text-text font-semibold">
              {getRoundNumber(round)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
