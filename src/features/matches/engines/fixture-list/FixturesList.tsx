import { Text } from '@/components';
import { cn } from '@/lib/nativewind/nativeWind';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, Platform, Pressable, View } from 'react-native';

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
  currentFixture?: number;
  dateRange?: string;
  onPress: (fixture: number) => void;
};

const fixtureWidth = 70;
const fixtureMargin = 7;
const fixtureItemSpacing = fixtureWidth + fixtureMargin * 2;

const FixtureItem = ({ fixture, selectedFixture, currentFixture, dateRange, onPress }: FixtureItemProps) => {
  const { t } = useTranslation();
  const isSelected = selectedFixture === fixture;
  const isToday = currentFixture !== undefined && fixture === currentFixture;

  const opacity = isSelected || isToday ? 1 : currentFixture !== undefined && fixture < currentFixture ? 0.38 : 0.8;

  return (
    <View style={{ opacity }} className="items-center mx-2">
      <Pressable
        onPress={() => onPress(fixture)}
        accessibilityRole="tab"
        accessibilityLabel={`${t('Fixture {{number}}', { number: fixture })}${dateRange ? `, ${dateRange}` : ''}`}
        accessibilityState={{ selected: isSelected }}
        style={
          {
            width: fixtureWidth,
            transition: Platform.OS === 'web' ? 'transform 0.15s ease-in-out' : undefined,
          } as any
        }
        className={cn(
          'min-h-12 rounded-xl justify-center items-center overflow-hidden py-2 bg-surface border',
          isToday ? 'border-primary' : isSelected ? 'border-muted' : 'border-border',
          Platform.OS === 'web' && 'hover:scale-105 active:scale-95',
        )}
      >
        {isToday && <View className="absolute inset-x-0 inset-y-0 bg-primary" style={{ height: 4 }} />}
        <Text
          style={
            {
              transition: Platform.OS === 'web' ? 'color 0.1s ease-in-out' : undefined,
            } as any
          }
          className={cn('text-xl', isToday ? 'text-primary' : isSelected ? 'text-text' : 'text-muted')}
        >
          {fixture}
        </Text>
      </Pressable>
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

    const index = fixtures.findIndex((fixture) => fixture === selectedFixture);
    if (index === -1) return;

    if (Platform.OS === 'web') {
      setTimeout(() => {
        ref.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 50);
    } else {
      ref.current.scrollToIndex({
        index,
        animated: animateScroll,
        viewPosition: 0.5,
      });
    }
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
    [fixtures.length],
  );

  return (
    <FlatList
      ref={ref}
      data={fixtures}
      onLayout={onLayout}
      horizontal
      contentContainerStyle={{ paddingVertical: 5, paddingTop: 5 }}
      showsHorizontalScrollIndicator={false}
      className="shrink-0 grow-0"
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <FixtureItem
          fixture={item}
          selectedFixture={selectedFixture}
          currentFixture={currentFixture}
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
      {...(Platform.OS === 'web' && {
        scrollEventThrottle: 16,
        removeClippedSubviews: false,
      })}
    />
  );
}
