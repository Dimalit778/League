import { useEffect, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  console.log('selectedRound:', selectedRound);

  const flatListRef = useRef<FlatList<string>>(null);

  const handlePress = (round: string, index: number) => {
    handleRoundPress(round);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };
  // 👉 Center the initial selected item when the component mounts
  useEffect(() => {
    const index = rounds.findIndex((round) => round === selectedRound);
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5,
        });
      }, 0);
    }
  }, []);

  return (
    <View className="my-3 mx-1">
      <FlatList
        ref={flatListRef}
        data={rounds}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item: round, index }) => {
          return (
            <TouchableOpacity
              onPress={() => handlePress(round, index)}
              className={selectedRound === round ? 'bg-primary' : 'bg-surface'}
              style={styles.item}
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
        getItemLayout={(_, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  item: {
    height: 50,
    width: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
