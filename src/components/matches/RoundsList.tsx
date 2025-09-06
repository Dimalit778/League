import { useEffect, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

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
  const ref = useRef<FlatList<string>>(null);
  const refIndex = useRef<number>(0);

  const selectedIndex = rounds.findIndex((round) => round === selectedRound);
  useEffect(() => {
    refIndex.current = selectedIndex;
    ref.current?.scrollToIndex({
      index: selectedIndex,
      viewPosition: 0.5,
      animated: true,
    });
  }, [selectedIndex]);

  const handlePress = (round: string, index: number) => {
    handleRoundPress(round);
    ref.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  return (
    <View className="my-3 mx-1">
      <FlatList
        ref={ref}
        // initialScrollIndex={selectedIndex}
        data={rounds}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        getItemLayout={(_, index) => ({
          length: 55,
          offset: 55 * index,
          index,
        })}
        renderItem={({ item: round, index }) => {
          return (
            <TouchableOpacity
              onPress={() => handlePress(round, index)}
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
                {round.match(/(\d+)$/)?.[1] ?? ''}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
