import { TrophyIcon } from '@/assets/icons';
import { Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export const CollapsedHeader = ({ nickname }: { nickname?: string | undefined }) => {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="min-w-0 flex-1 flex-row-reverse items-center gap-2.5">
        <Text variant="titleLarge" className="min-w-0 flex-1" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <View className="h-12 w-12 shrink-0" />
    </Row>
  );
};

export const PersistentHeaderAction = () => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Row className="items-start justify-end px-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('My leagues')}
        hitSlop={10}
        className="z-10 items-center justify-center rounded-full border border-border bg-subtle active:opacity-70 w-12 h-12"
        onPress={() => {
          router.push('/(app)/(user)/leagues/my-leagues');
        }}
      >
        <TrophyIcon size={24} color={colors.text} />
      </Pressable>
    </Row>
  );
};
