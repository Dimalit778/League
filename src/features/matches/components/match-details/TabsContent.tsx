import { Button, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MatchWithPredictions } from '../../types';
import MatchStats from './MatchStats';
import PredictionRank from './PredictionRank';

const tabs = [
  { id: 0, title: 'PREDICTIONS', icon: 'users' as const },
  { id: 1, title: 'STATS', icon: 'bar-chart-2' as const },
];

const LockedStats = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <View className="flex-1 bg-background px-6 pt-14">
      <View className="items-center rounded-2xl border border-border bg-surface px-6 py-8">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Feather name="lock" size={30} color={colors.primary} />
        </View>

        <Text className="text-xl text-center text-text">
          {t('Premium stats only')}
        </Text>
        <Text className="text-sm mt-3 text-center text-muted">
          {t('Upgrade to Pro to unlock match statistics')}
        </Text>

        <Button
          title={t('Upgrade to Pro')}
          onPress={() => router.push('/(app)/(user)/settings')}
          className="mt-6 w-full"
        />
      </View>
    </View>
  );
};

export default function TabsContent({ predictions }: { predictions: MatchWithPredictions['predictions'] }) {
  const { t } = useTranslation();
  const { subscription } = useRevenueCatSubscription();
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const canViewStats = subscription.isActive;

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
              <Feather name={tab.icon} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text className={`font-semibold text-sm ml-2  ${isActive ? 'text-primary' : 'text-muted'}`}>
                {t(tab.title)}
              </Text>
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
          getItemLayout={(_data, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          renderItem={({ item }) => {
            return (
              <View style={{ width: containerWidth }}>
                {item.id === 0 && <PredictionRank predictions={predictions} />}
                {item.id === 1 && (canViewStats ? <MatchStats stats={[]} /> : <LockedStats />)}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
