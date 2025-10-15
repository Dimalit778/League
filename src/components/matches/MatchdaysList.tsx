import { useThemeTokens } from '@/hooks/useThemeTokens';
import { memo, useCallback, useEffect, useRef } from 'react';
import { FlatList, Pressable, Text } from 'react-native';

type MatchdaysListProps = {
  matchdays: number[];
  selectedMatchday: number;
  handleMatchdayPress: (matchday: number) => void;
};

type MatchdayItemProps = {
  matchday: number;
  selectedMatchday: number;
  colors: {
    primary: string;
    surface: string;
    background: string;
    text: string;
  };
  onPress: (matchday: number) => void;
};

const MatchdayItem = memo(
  ({ matchday, selectedMatchday, colors, onPress }: MatchdayItemProps) => {
    const isSelected = selectedMatchday === matchday;

    return (
      <Pressable
        onPress={() => onPress(matchday)}
        style={{
          height: 50,
          width: 50,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 5,
          backgroundColor: isSelected ? colors.primary : colors.surface,
        }}
      >
        <Text
          className="text-text font-semibold"
          style={{
            color: isSelected ? colors.background : colors.text,
          }}
        >
          {matchday}
        </Text>
      </Pressable>
    );
  }
);

const MatchdaysList = ({
  matchdays,
  selectedMatchday,
  handleMatchdayPress,
}: MatchdaysListProps) => {
  const ref = useRef<FlatList>(null);
  const { colors } = useThemeTokens();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollToIndex({
        index: selectedMatchday - 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [ref, selectedMatchday]);

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <MatchdayItem
        matchday={item}
        selectedMatchday={selectedMatchday}
        colors={colors}
        onPress={handleMatchdayPress}
      />
    ),
    [selectedMatchday, colors, handleMatchdayPress]
  );

  const keyExtractor = useCallback((item: number) => item.toString(), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 60,
      offset: 60 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      ref={ref}
      data={matchdays}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      renderItem={renderItem}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
    />
  );
};

export default MatchdaysList;
