import { CText } from '@/components/ui/CText';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { formatNameCapitalize } from '@/utils/formats';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
type LeagueHeaderProps = {
  settingsHref?: Href;
};

export default function LeagueHeader({ settingsHref = '/(app)/(user)/settings' }: LeagueHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const displayName = formatNameCapitalize(user?.full_name) || t('Player');

  return (
    <View className="bg-transparent px-4 pb-3 pt-2">
      <View style={styles.shadow}>
        <LinearGradient
          colors={['#0B1B33', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="border border-border"
          style={styles.card}
        >
          <View className="flex-row items-center justify-between gap-3 px-4 py-3.5">
            <View className="min-w-0 flex-1">
              <CText className="text-sm font-medium uppercase tracking-widest text-muted">{t('Hello')}</CText>
              <CText className="mt-0.5 text-2xl font-black text-white" numberOfLines={1}>
                {displayName}
              </CText>
            </View>

            <Pressable
              onPress={() => router.push(settingsHref)}
              accessibilityRole="button"
              accessibilityLabel={t('Settings')}
              className="h-11 w-11 items-center justify-center rounded-full border border-[#D5B13F]/35 bg-[#091425]/80"
              style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
            >
              <Settings size={24} strokeWidth={1} color={colors.primary} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
