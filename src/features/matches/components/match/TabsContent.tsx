import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { PredictionMemberType } from '../../types';
import MatchStats from './MatchStats';
import PredictionRank from './PredictionRank';

const tabs = [
  { id: 0, title: 'PREDICTIONS', icon: 'users' as const },
  { id: 1, title: 'STATS', icon: 'bar-chart-2' as const },
];
export default function TabsContent({ predictions }: { predictions: PredictionMemberType[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);
  const { colors } = useThemeTokens();
  const onTabPress = (index: number) => {
    isScrollingProgrammatically.current = true;
    setActiveTab(index);
    (flatListRef.current as any)?.scrollToIndex({ index, animated: true });
    // Reset flag after animation completes
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number }[] }) => {
    if (viewableItems.length > 0 && !isScrollingProgrammatically.current) {
      setActiveTab(viewableItems[0].index);
    }
  }).current;

  return (
    <View className="flex-1 bg-background border-t border-border rounded-t-3xl ">
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
              <Text className={`ml-2 font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>{tab.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        ref={flatListRef}
        data={tabs}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onViewableItemsChanged={(info) => onViewableItemsChanged(info as any)}
        viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
        renderItem={({ item }) => {
          return (
            <View style={{ width: width }}>
              {item.id === 0 && <PredictionRank predictions={predictions} />}
              {item.id === 1 && <MatchStats stats={[]} />}
            </View>
          );
        }}
      />
    </View>
  );
}
const { width } = Dimensions.get('window');
