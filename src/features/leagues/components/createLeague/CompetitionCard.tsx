import { Card, LockedBadge, MyImage, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { Tables } from '@/types/database.types';
import { View } from 'react-native';

type Competition = Tables<'competitions'>;

type CompetitionCardProps = {
  competition: Competition;
  isSelected: boolean;
  isLocked: boolean;
  onPress: (competition: Competition) => void;
};

export default function CompetitionCard({ competition, isSelected, isLocked, onPress }: CompetitionCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const flag = competition.flag ?? '';
  const isSvgFlag = flag.toLowerCase().includes('.svg');

  return (
    <Card onPress={() => onPress(competition)} padding="none" className="flex-1">
      <View className="relative overflow-hidden rounded-xl">
        <View
          className="flex-1 items-center p-4 border-2 bg-surface rounded-xl"
          style={{ borderColor: isSelected ? colors.primary : colors.border }}
        >
          <MyImage
            source={flag}
            width={48}
            height={48}
            cachePolicy="memory-disk"
            contentFit="contain"
            priority="high"
            forceSvg={isSvgFlag}
          />

          <Text variant="body" size="sm" tone="muted">
            {t(competition.area)}
          </Text>
          <Text
            variant="body"
            numberOfLines={1}
            className={cn('font-semibold text-center', isSelected ? 'text-primary' : 'text-text')}
          >
            {t(competition.name)}
          </Text>
        </View>

        <LockedBadge visible={isLocked} />
      </View>
    </Card>
  );
}
