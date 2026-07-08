import { Text, UpgardeBadge } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { Pressable, View } from 'react-native';

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

  return (
    <Pressable
      onPress={() => onPress(competition)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      className="mb-3"
    >
      <View className="relative overflow-hidden rounded-xl">
        <View
          className="flex-row items-center p-4 border-2 bg-surface rounded-xl"
          style={{ borderColor: isSelected ? colors.primary : colors.border }}
        >
          <ExpoImage
            source={competition.flag}
            style={{ width: 48, height: 48 }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={120}
            priority="high"
          />
          <View className="flex-1 items-center">
            <Text variant="caption" className="text-muted">
              {t(competition.area)}
            </Text>
            <Text
              variant="body"
              bold
              className="text-center"
              style={{ color: isSelected ? colors.primary : colors.text }}
            >
              {t(competition.name)}
            </Text>
          </View>
          <ExpoImage
            source={competition.logo}
            style={{ width: 52, height: 52 }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={120}
            priority="high"
          />
        </View>
        <UpgardeBadge visible={isLocked} />
      </View>
    </Pressable>
  );
}
