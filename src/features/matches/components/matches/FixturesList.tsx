import { CText } from '@/components/ui';
import { cn } from '@/lib/nativeWind';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, Pressable, View } from 'react-native';

type FixturesListProps = {
  fixtures: number[];
  selectedFixture: number;
  currentFixture?: number;
  handleFixturePress: (fixture: number) => void;
  animateScroll: boolean;
  fixtureDateRanges: Record<number, string>;
};

type FixtureItemProps = {
  fixture: number;
  selectedFixture: number;
  isToday?: boolean;
  dateRange?: string;
  onPress: (fixture: number) => void;
};
const fixtureWidth = 55;
const fixtureHeight = 30;
const fixtureMargin = 7;
const fixtureItemSpacing = fixtureWidth + fixtureMargin * 2;
const FixtureItem = ({ fixture, selectedFixture, isToday, dateRange, onPress }: FixtureItemProps) => {
  const isSelected = selectedFixture === fixture;

  return (
    <View className="items-center justify-center gap-y-1 ">
      <Pressable
        onPress={() => onPress(fixture)}
        style={{
          width: fixtureWidth,
          height: fixtureHeight,
        }}
        className={cn(
          'rounded-lg justify-center items-center mx-2 overflow-hidden',
          isSelected ? 'bg-primary text-text' : isToday ? 'border-[1px] border-text' : 'border-[0.5px] border-border'
        )}
      >
        <CText
          className={cn(
            'text-text font-bold text-sm',
            isToday ? 'text-text' : 'text-text',
            isSelected ? 'text-background' : 'text-muted'
          )}
        >
          {fixture}
        </CText>
      </Pressable>
      {dateRange && <CText className="text-text text-xs ">{dateRange}</CText>}
    </View>
  );
};

export default function FixturesList({
  fixtures,
  selectedFixture,
  currentFixture,
  handleFixturePress,
  animateScroll,
  fixtureDateRanges,
}: FixturesListProps) {
  const ref = useRef<FlatList>(null);

  const [listWidth, setListWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setListWidth(e.nativeEvent.layout.width);

  useEffect(() => {
    if (!ref.current || !selectedFixture || listWidth === 0 || fixtures.length === 0) return;

    // Find the actual index of selectedFixture in the fixtures array
    const index = fixtures.findIndex((fixture) => fixture === selectedFixture);
    if (index === -1) return;

    ref.current.scrollToIndex({
      index,
      animated: animateScroll,
      viewPosition: 0.5,
    });
  }, [selectedFixture, listWidth, animateScroll, fixtures]);

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number }) => {
      const maxIndex = fixtures.length - 1;
      const safeIndex = Math.min(info.index, maxIndex);

      setTimeout(() => {
        ref.current?.scrollToIndex({
          index: Math.max(0, safeIndex),
          animated: true,
          viewPosition: 0.5,
        });
      }, 50);
    },
    [fixtures.length]
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
            isToday={currentFixture !== undefined && item === currentFixture}
            dateRange={fixtureDateRanges[item]}
            onPress={handleFixturePress}
          />
        )}
        getItemLayout={(_, index) => ({
          length: fixtureItemSpacing,
          offset: fixtureItemSpacing * index,
          index,
        })}
        initialScrollIndex={Math.max(0, fixtures.findIndex((f) => f === selectedFixture) || 0)}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
}
