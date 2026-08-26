import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import Feather from '@expo/vector-icons/Feather';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { MatchDetails } from '../../types';
import AiAnalysisCard from './AiAnalysisCard';
import PredictionRank from './PredictionRank';

const tabs = [
  { id: 0, title: 'Predictions', icon: 'users' as const },
  { id: 1, title: 'AI Analysis', icon: 'cpu' as const },
];

export default function MatchDetailsTabs({ match }: { match: MatchDetails }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);

  const onTabPress = (index: number) => {
    isScrollingProgrammatically.current = true;
    setActiveTab(index);

    try {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } catch (error) {
      console.error(error);
      flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
    }

    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    const visibleIndex = viewableItems[0]?.index;
    if (!isScrollingProgrammatically.current && visibleIndex != null) setActiveTab(visibleIndex);
  }).current;
  const pageStyle = useMemo(() => ({ width: containerWidth }), [containerWidth]);
  const renderItem = useCallback(
    ({ item }: { item: (typeof tabs)[number] }) => (
      <View style={pageStyle} className="flex-1">
        {item.id === 0 ? <PredictionRank predictions={match.predictions ?? []} /> : <AiAnalysisCard match={match} />}
      </View>
    ),
    [match, pageStyle],
  );

  return (
    <View className="flex-1" onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
      <View className="flex-row justify-around pt-4">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(index)}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.title)}
              accessibilityState={{ selected: isActive }}
              className={`min-h-12 flex-row items-center border-b-2 px-4 pb-3 ${isActive ? 'border-primary' : 'border-border'}`}
            >
              <Feather name={tab.icon} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text className={`ml-2 text-sm font-semibold ${isActive ? 'text-primary' : 'text-muted'}`}>
                {t(tab.title)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {containerWidth > 0 ? (
        <FlatList
          ref={flatListRef}
          data={tabs}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
          getItemLayout={(_data, index) => ({ length: containerWidth, offset: containerWidth * index, index })}
          renderItem={renderItem}
        />
      ) : null}
    </View>
  );
}
