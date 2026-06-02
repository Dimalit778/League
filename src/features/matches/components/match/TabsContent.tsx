import { Button, CText } from '@/components/ui';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { PredictionMemberType } from '../../types';
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

        <CText variant="h3" className="text-center text-text">
          {t('Premium stats only')}
        </CText>
        <CText variant="caption" className="mt-3 text-center text-muted">
          {t('Upgrade to Pro to unlock match statistics')}
        </CText>

        <Button
          title={t('Upgrade to Pro')}
          onPress={() => router.push('/(app)/(public)/subscription')}
          className="mt-6 w-full"
        />
      </View>
    </View>
  );
};

export default function TabsContent({ predictions }: { predictions: PredictionMemberType[] }) {
  const { t } = useTranslation();
  const { data: subscription } = useSubscription();
  const [activeTab, setActiveTab] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isScrollingProgrammatically = useRef(false);
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const canViewStats = subscription.type === 'PRO';

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
