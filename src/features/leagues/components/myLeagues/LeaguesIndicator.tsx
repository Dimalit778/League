import { Button, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type LeaguesIndicatorProps = {
  used: number;
  limit: number;
  onPress?: () => void;
};

export default function LeaguesIndicator({ used, limit, onPress }: LeaguesIndicatorProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const progress = Math.min(used / limit, 1);
  const reachedLimit = limit === used;

  return (
    <>
      {!reachedLimit && (
        <View className="flex-row items-center justify-around gap-2 p-4">
          <Button title={t('Create League')} onPress={() => router.push('/leagues/create-league')} variant="outline" />
          <Button title={t('Join League')} onPress={() => router.push('/leagues/join-league')} variant="outline" />
        </View>
      )}
      <Pressable onPress={onPress} className="mx-5 rounded-2xl bg-surface px-2 py-3">
        <View className="flex-row items-center">
          {/* Icon */}
          <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-border">
            <Trophy size={26} color={colors.primary} strokeWidth={1.8} />
          </View>

          {/* Content */}
          <View className="flex-1 pe-2 ">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">{t('Leagues')}</Text>

              <Text className="text-muted">
                {used}/{limit}
              </Text>
            </View>

            {/* Progress bar */}
            <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surfaceSecondary">
              <View className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
            </View>
          </View>
          <ChevronRight size={28} color={colors.muted} strokeWidth={2} />
          {/* Arrow */}
        </View>
      </Pressable>
    </>
  );
}
