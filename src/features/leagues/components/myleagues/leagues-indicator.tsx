import { CText } from '@/components/ui/CText';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
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

  return (
    <Pressable onPress={onPress} className="mx-5 rounded-2xl border border-border bg-background px-2 py-3">
      <View className="flex-row items-center">
        {/* Icon */}
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface">
          <Trophy size={26} color={colors.primary} strokeWidth={1.8} />
        </View>

        {/* Content */}
        <View className="flex-1 pe-2 ">
          <View className="flex-row items-center justify-between">
            <CText className="text-muted">{t('Leagues')}</CText>

            <CText className="text-muted">
              {used}/{limit}
            </CText>
          </View>

          {/* Progress bar */}
          <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
          </View>
        </View>
        <ChevronRight size={28} color={colors.primary} strokeWidth={2} />
        {/* Arrow */}
      </View>
    </Pressable>
  );
}
