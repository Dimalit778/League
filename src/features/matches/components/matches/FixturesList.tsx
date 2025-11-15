import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

type FixturesListProps = {
  fixtures: number[];
  selectedFixture: number;
  handleFixturePress: (fixture: number) => void;
  animateScroll: boolean;
};

type FixtureItemProps = {
  fixture: number;
  selectedFixture: number;
  colors: {
    primary: string;
    surface: string;
    background: string;
    text: string;
  };
  onPress: (fixture: number) => void;
};

const FixtureItem = memo(
  ({ fixture, selectedFixture, colors, onPress }: FixtureItemProps) => {
    const isSelected = selectedFixture === fixture;

    return (
      <Pressable
        onPress={() => onPress(fixture)}
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
          {fixture}
        </Text>
      </Pressable>
    );
  }
);

export default function FixturesList({
  fixtures,
  selectedFixture,
  handleFixturePress,
  animateScroll,
}: FixturesListProps) {
  const ref = useRef<FlatList>(null);
  const { colors } = useThemeTokens();
  const [listWidth, setListWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setListWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    if (!ref.current || !selectedFixture || listWidth === 0) return;

    ref.current.scrollToIndex({
      index: selectedFixture - 1,
      animated: animateScroll,
      viewPosition: 0.5,
    });
  }, [selectedFixture, listWidth]);

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

  return (
    <View>
      <FlatList
        ref={ref}
        data={fixtures}
        onLayout={onLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <FixtureItem
            key={item.toString()}
            fixture={item}
            selectedFixture={selectedFixture}
            colors={colors ?? {}}
            onPress={handleFixturePress}
          />
        )}
        style={{
          paddingBottom: 5,
        }}
        getItemLayout={(_, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
        initialScrollIndex={Math.max(0, (selectedFixture ?? 1) - 1)}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
}
