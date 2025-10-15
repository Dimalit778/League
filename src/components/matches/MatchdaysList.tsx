import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect, useRef } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';

type MatchdaysListProps = {
  matchdays: number[];
  selectedMatchday: number;
  handleMatchdayPress: (matchday: number) => void;
};

const MatchdaysList = ({
  matchdays,
  selectedMatchday,
  handleMatchdayPress,
}: MatchdaysListProps) => {
  const flatListRef = useRef<FlatList<number>>(null);
  const { colors } = useThemeTokens();

  const handlePress = (matchday: number, index: number) => {
    handleMatchdayPress(matchday);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  useEffect(() => {
    const index = matchdays.findIndex(
      (matchday) => matchday === selectedMatchday
    );
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
    <FlatList
      ref={flatListRef}
      data={matchdays}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item: matchday, index }) => {
        return (
          <TouchableOpacity
            onPress={() => handlePress(matchday, index)}
            style={{
              height: 50,
              width: 50,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 5,
              backgroundColor:
                selectedMatchday === matchday ? colors.primary : colors.surface,
            }}
          >
            <Text
              className={`text-text font-semibold ${
                selectedMatchday === matchday ? 'text-background' : 'text-text'
              }`}
            >
              {matchday}
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
  );
};

export default MatchdaysList;
