import { CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { PredictionMemberType } from '../../types';
import MatchStats from './MatchStats';
import PredictionRank from './PredictionRank';

const tabs = [
  { id: 0, title: 'PREDICTIONS', icon: 'users' as const },
  { id: 1, title: 'STATS', icon: 'bar-chart-2' as const },
];
export default function TabsContent({ predictions }: { predictions: PredictionMemberType[] }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);

  const onTabPress = (index: number) => {
    isScrollingProgrammatically.current = true;
    setActiveTab(index);

    // Add error handling for scrollToIndex
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } catch (error) {
      // Fallback: scroll to offset
      flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
    }

    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    if (viewableItems.length > 0 && !isScrollingProgrammatically.current && viewableItems[0].index !== null) {
      setActiveTab(viewableItems[0].index!);
    }
  }).current;

  return (
    <View className="flex-1 " onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View className="flex-row justify-around pt-4">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(index)}
              className={`flex-row items-center pb-3 px-4 ${isActive ? 'border-b-2 border-primary' : 'border-b-2 border-border transparent'}`}
            >
              <Feather name={tab.icon} size={20} color={isActive ? colors.primary : colors.muted} />
              <CText variant="bodyBold" className={`ml-2  ${isActive ? 'text-primary' : 'text-muted'}`}>
                {t(tab.title)}
              </CText>
            </TouchableOpacity>
          );
        })}
      </View>
      {containerWidth > 0 && (
        <FlatList
          ref={flatListRef}
          data={tabs}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
          getItemLayout={(data, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          renderItem={({ item }) => {
            return (
              <View style={{ width: containerWidth }}>
                {item.id === 0 && <PredictionRank predictions={predictions} />}
                {item.id === 1 && <MatchStats stats={[]} />}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
