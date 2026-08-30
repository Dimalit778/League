import { TrophyIcon } from '@/assets/icons';
import { LogoBadge, Row, TabButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CollapsedHeader = ({ nickname }: { nickname?: string }) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="h-9 w-9 shrink-0" />
      <View className="min-w-0 items-center justify-center ">
        <Text variant="title" size="lg" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <View className="shrink-0" style={{ width: 40, height: 40 }} />
    </Row>
  );
};

export const ExpandedHeader = ({ nickname = 'there' }: { nickname?: string }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 px-4" style={{ paddingTop: insets.top }}>
      <Text variant="title" className="text-white/80" numberOfLines={1}>
        {t('Hello')}
      </Text>
      <Text variant="heading" size="5xl" className="text-white  " numberOfLines={1}>
        {nickname}
      </Text>
    </View>
  );
};

export const PersistentHeaderActions = ({ flagUrl, leagueName }: { flagUrl: string; leagueName: string }) => {
  return (
    <Row className="justify-between px-4">
      <View className="flex-row items-center gap-2">
        <LogoBadge source={flagUrl} width={40} height={40} className="rounded-md" />
        <Text className="text-white/80 font-manrope-medium">{leagueName}</Text>
      </View>

      <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} />
    </Row>
  );
};
