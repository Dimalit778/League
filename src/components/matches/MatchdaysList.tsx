import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect, useRef } from 'react';
import { FlatList, Pressable, Text, useWindowDimensions } from 'react-native';

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
  const ref = useRef<FlatList>(null);
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();

  const handlePress = (matchday: number, index: number) => {
    handleMatchdayPress(matchday);
    console.log('Scrolling to index:', index, 'matchday:', matchday);
    // ref.current?.scrollToIndex({
    //   index,
    //   animated: true,
    //   viewPosition: 0.5,
    // });
  };
  useEffect(() => {
    const initialIndex = 20; //random number
    if (ref.current) {
      ref.current.scrollToIndex({ index: initialIndex });
    }
  }, [ref]);

  const Item = ({ item: matchday, index }: { item: number; index: number }) => {
    return (
      <Pressable
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
          className="text-text font-semibold"
          style={{
            color:
              selectedMatchday === matchday ? colors.background : colors.text,
          }}
        >
          {matchday}
        </Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      ref={ref}
      data={matchdays}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.toString()}
      getItemLayout={(_, index) => ({
        length: 60,
        offset: 60 * index,
        index,
      })}
      renderItem={Item}
    />
  );
};

export default MatchdaysList;
