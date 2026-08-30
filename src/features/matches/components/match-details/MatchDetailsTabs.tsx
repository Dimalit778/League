import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { BrainCircuit, Users, type LucideIcon } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { MatchDetails } from '../../types';
import AiAnalysisCard from './AiAnalysisCard';
import PredictionRank from './PredictionRank';

const tabs: { id: number; title: string; icon: LucideIcon }[] = [
  { id: 0, title: 'Predictions', icon: Users },
  { id: 1, title: 'AI Analysis', icon: BrainCircuit },
];
const AI_TAB_ID = 1;

export default function MatchDetailsTabs({
  match,
  isPredictionsLoading = false,
}: {
  match: MatchDetails;
  isPredictionsLoading?: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hasOpenedAi, setHasOpenedAi] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);

  const onTabPress = (index: number) => {
    if (tabs[index]?.id === AI_TAB_ID) setHasOpenedAi(true);
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
    if (visibleIndex == null) return;

    if (tabs[visibleIndex]?.id === AI_TAB_ID) setHasOpenedAi(true);
    if (!isScrollingProgrammatically.current) setActiveTab(visibleIndex);
  }).current;
  const pageStyle = useMemo(() => ({ width: containerWidth }), [containerWidth]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof tabs)[number] }) => (
      <View style={pageStyle} className="flex-1 py-4">
        {item.id === 0 ? (
          <PredictionRank predictions={match.predictions ?? []} isLoading={isPredictionsLoading} />
        ) : hasOpenedAi ? (
          <AiAnalysisCard match={match} />
        ) : null}
      </View>
    ),
    [hasOpenedAi, isPredictionsLoading, match, pageStyle],
  );

  return (
    <View
      testID="match-details-tabs"
      className="flex-1"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View className="flex-row justify-around bg-surface">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(index)}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.title)}
              accessibilityState={{ selected: isActive }}
              className={`min-h-16 flex-row items-center border-b-2  gap-3 ${isActive ? 'border-primary' : 'border-border'}`}
            >
              <Icon size={20} color={isActive ? colors.primary : colors.muted} strokeWidth={2} />
              <Text className={`text-2xl font-sport ${isActive ? 'text-primary' : 'text-muted'}`}>{t(tab.title)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {containerWidth > 0 ? (
        <FlatList
          testID="match-details-pages"
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
