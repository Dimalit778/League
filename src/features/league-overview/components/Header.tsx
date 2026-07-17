import { LogoBadge, Text } from '@/components/ui';
import { HeaderSection } from '@/components/ui/HeaderSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Star } from 'lucide-react-native';
import { View } from 'react-native';

export default function Header({
  leagueName,
  logoUrl,
  points,
  nickname,
}: {
  leagueName: string;
  logoUrl: string;
  points: number;
  nickname: string;
}) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <HeaderSection>
      <View className="min-w-0 flex-1 p-4">
        <View className="flex-row items-center gap-4">
          <LogoBadge source={{ uri: logoUrl }} width={48} height={48} />

          <View className="flex-1">
            <Text h2 semibold numberOfLines={1}>
              {leagueName}
            </Text>

            <Text h3 className="text-muted">
              {nickname}
            </Text>
          </View>
          <View className=" items-center gap-1.5">
            <View className="flex-row items-center justify-center gap-1.5">
              <Star size={18} color={colors.primary} fill={colors.primary} />

              <Text small className="text-muted" numberOfLines={1}>
                {t('Points')}
              </Text>
            </View>

            <Text semibold className="text-text" numberOfLines={1}>
              {`${points} ${t('pts')}`}
            </Text>
          </View>
        </View>
      </View>
    </HeaderSection>
  );
}
