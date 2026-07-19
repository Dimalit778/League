import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { formatNameCapitalize } from '@/utils/formats';
import { Href, router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
type LeagueHeaderProps = {
  settingsHref?: Href;
};

export default function LeagueHeader({ settingsHref = '/(app)/(user)/settings' }: LeagueHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const displayName = formatNameCapitalize(user?.full_name) || t('Player');

  return (
    <View className="flex-row items-center justify-between gap-3 px-4 pb-2">
      <View className="min-w-0 flex-1">
        <Text h2 numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push(settingsHref)}
        accessibilityRole="button"
        accessibilityLabel={t('Settings')}
        className="p-2 items-center justify-center rounded-full bg-surfaceSoft"
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
      >
        <Settings size={28} strokeWidth={1.5} color={colors.text} />
      </Pressable>
    </View>
  );
}
