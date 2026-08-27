import { TrophyIcon } from '@/assets/icons';
import { TabButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MatchesTopBar({ center }: { center?: ReactNode }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="w-full px-4" style={{ paddingTop: insets.top }}>
      <View className="relative w-full justify-center h-12">
        <View className="absolute inset-0 items-center justify-center" pointerEvents="box-none">
          <Text variant="title" numberOfLines={1} className="text-center">
            {t('Matches')}
          </Text>
        </View>
        <View className="absolute end-0 top-0" pointerEvents="box-none">
          <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} />
        </View>
      </View>
    </View>
  );
}
