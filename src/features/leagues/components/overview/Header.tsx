import { TrophyIcon } from '@/assets/icons';
import { LogoBadge, Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export const CollapsedHeader = ({ nickname }: { nickname?: string }) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="h-9 w-9 shrink-0" />
      <View className="min-w-0 items-center justify-center ">
        <Text variant="subtitle" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <View className="shrink-0" style={{ width: 40, height: 40 }} />
    </Row>
  );
};

export const ExpandedHeader = ({ nickname = 'there' }: { nickname?: string }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center pt-8">
      <Text variant="title" className="text-white/80" numberOfLines={1}>
        {t('Hello')}
      </Text>
      <Text variant="display" className="text-white " numberOfLines={1}>
        {nickname}
      </Text>
    </View>
  );
};

export const PersistentHeaderActions = ({ logoUrl }: { logoUrl: string }) => {
  const { colors } = useThemeTokens();

  return (
    <Row className="justify-between px-4">
      <LogoBadge source={logoUrl} width={40} height={40} className="rounded-full" />
      <Pressable
        hitSlop={10}
        className="z-10 items-center justify-center rounded-full border border-border bg-subtle active:opacity-70"
        style={{ width: 40, height: 40 }}
        onPress={() => {
          router.push('/(app)/(user)/leagues/my-leagues');
        }}
      >
        <TrophyIcon size={24} color={colors.text} />
      </Pressable>
    </Row>
  );
};
