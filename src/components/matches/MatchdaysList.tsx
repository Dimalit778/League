import { useThemeTokens } from '@/hooks/useThemeTokens';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, Pressable, Text } from 'react-native';

type MatchdaysListProps = {
  matchdays: number[];
  selectedMatchday: number;
  handleMatchdayPress: (matchday: number) => void;
  animateScroll: boolean;
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
  animateScroll,
}: MatchdaysListProps) => {
  const ref = useRef<FlatList>(null);
  const { colors } = useThemeTokens();
  const [listWidth, setListWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setListWidth(e.nativeEvent.layout.width);

  console.log('animateScroll', animateScroll);

  useEffect(() => {
    if (!ref.current || !selectedMatchday || listWidth === 0) return;

    ref.current.scrollToIndex({
      index: selectedMatchday - 1,
      animated: animateScroll,
      viewPosition: 0.5,
    });
  }, [selectedMatchday, listWidth]);

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number }) => {
      setTimeout(() => {
        ref.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 50);
    },
    []
  );

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

  return (
    <FlatList
      ref={ref}
      data={matchdays}
      onLayout={onLayout}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.toString()}
      renderItem={renderItem}
      updateCellsBatchingPeriod={50}
      getItemLayout={(_, index) => ({
        length: 60,
        offset: 60 * index,
        index,
      })}
      initialScrollIndex={Math.max(0, (selectedMatchday ?? 1) - 1)}
      onScrollToIndexFailed={onScrollToIndexFailed}
    />
  );
};

export default MatchdaysList;
