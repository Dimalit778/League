import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { useLayoutEffect, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, Platform, Pressable, View } from 'react-native';
import {
  FIXTURE_CHIP_WIDTH,
  getCenteredFixtureOffset,
  getFixtureItemLayout,
  getFixtureListIndex,
} from './fixtureListLayout';

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

const FixtureItem = ({ fixture, selectedFixture, currentFixture, dateRange, onPress }: FixtureItemProps) => {
  const { t } = useTranslation();
  const isSelected = selectedFixture === fixture;
  const isToday = currentFixture !== undefined && fixture === currentFixture;

  return (
    <View className="items-center mx-2">
      <Pressable
        onPress={() => onPress(fixture)}
        accessibilityRole="tab"
        accessibilityLabel={`${t('Fixture {{number}}', { number: fixture })}${dateRange ? `, ${dateRange}` : ''}`}
        accessibilityState={{ selected: isSelected }}
        style={
          {
            width: FIXTURE_CHIP_WIDTH,
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
          className={cn('text-xl text-text', isToday && 'text-primary')}
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
  const positionedRef = useRef(false);
  const [listWidth, setListWidth] = useState(0);
  const [isPositioned, setIsPositioned] = useState(false);

  const onLayout = (e: LayoutChangeEvent) => setListWidth(e.nativeEvent.layout.width);

  useLayoutEffect(() => {
    if (!ref.current || listWidth === 0 || fixtures.length === 0) return;

    const index = getFixtureListIndex(fixtures, selectedFixture);
    const offset = getCenteredFixtureOffset(index, listWidth, fixtures.length);
    const animated = positionedRef.current && animateScroll;

    const applyOffset = () => {
      ref.current?.scrollToOffset({ offset, animated });
      if (!positionedRef.current) {
        positionedRef.current = true;
        setIsPositioned(true);
      }
    };

    if (Platform.OS === 'web' && !positionedRef.current) {
      const timeoutId = setTimeout(applyOffset, 0);
      return () => clearTimeout(timeoutId);
    }

    applyOffset();
  }, [selectedFixture, listWidth, animateScroll, fixtures]);

  return (
    <FlatList
      ref={ref}
      data={fixtures}
      onLayout={onLayout}
      horizontal
      contentContainerStyle={{ paddingVertical: 5, paddingTop: 5 }}
      showsHorizontalScrollIndicator={false}
      className="shrink-0 grow-0"
      style={{ opacity: isPositioned ? 1 : 0 }}
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
      getItemLayout={(_, index) => getFixtureItemLayout(index)}
      {...(Platform.OS === 'web' && {
        scrollEventThrottle: 16,
        removeClippedSubviews: false,
      })}
    />
  );
}
