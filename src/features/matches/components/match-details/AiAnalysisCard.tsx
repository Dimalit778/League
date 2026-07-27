import { Button, TeamBadge, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { useLanguageStore } from '@/store/LanguageStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

type Logo = string | number | { uri: string; headers?: Record<string, string> };

type AiAnalysisCardProps = {
  summaryEn: string;
  summaryHe: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: Logo;
  awayTeamLogo?: Logo;
};

export default function AiAnalysisCard({
  summaryEn,
  summaryHe,
  predictedHomeScore,
  predictedAwayScore,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
}: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const summary = language === 'he' ? summaryHe : summaryEn;
  const { theme, colors } = useThemeTokens();
  const { subscription } = useRevenueCatSubscription();
  const isPro = subscription.isActive;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 32 }}
    >
      <View className="flex-1 justify-center">
        {/* Eyebrow */}
        <View className="mb-5 items-center">
          <View className="flex-row items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5">
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text small semibold className="ml-1.5 uppercase tracking-widest text-primary">
              {t('AI Prediction')}
            </Text>
          </View>
        </View>

        {/* Predicted scoreline — the hero */}
        <View className="overflow-hidden rounded-3xl border border-primary/20 bg-surfaceSoft">
          <View className="items-center border-b border-border/60 py-2.5">
            <Text small semibold className="uppercase tracking-[2px] text-muted">
              {t('Predicted Score')}
            </Text>
          </View>

          <View className="flex-row items-center px-3 py-6">
            <View className="min-w-0 flex-1 items-center">
              {homeTeamLogo ? <TeamBadge source={homeTeamLogo} width={52} height={52} /> : null}
              <Text semibold numberOfLines={2} className="mt-2 text-center">
                {homeTeamName}
              </Text>
            </View>

            <View className="flex-row items-center px-1">
              <Text font="teko-bold" style={{ fontSize: 58, lineHeight: 60 }} className="text-primary">
                {predictedHomeScore}
              </Text>
              <Text font="teko" style={{ fontSize: 30, lineHeight: 60 }} className="mx-1.5 text-muted">
                :
              </Text>
              <Text font="teko-bold" style={{ fontSize: 58, lineHeight: 60 }} className="text-primary">
                {predictedAwayScore}
              </Text>
            </View>

            <View className="min-w-0 flex-1 items-center">
              {awayTeamLogo ? <TeamBadge source={awayTeamLogo} width={52} height={52} /> : null}
              <Text semibold numberOfLines={2} className="mt-2 text-center">
                {awayTeamName}
              </Text>
            </View>
          </View>
        </View>

        {/* AI analysis */}
        <View className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="p-5">
            <View className="mb-3 flex-row items-center">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Ionicons name="analytics" size={16} color={colors.primary} />
              </View>
              <Text semibold className="ml-2">
                {t('AI match analysis')}
              </Text>
            </View>

            <Text body className="leading-7 text-text">
              {summary}
            </Text>
          </View>

          {!isPro && (
            <BlurView
              intensity={30}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
              className="items-center justify-center px-6"
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Feather name="lock" size={24} color={colors.primary} />
              </View>
              <Text semibold className="mt-3 text-center">
                {t('Unlock the full AI analysis with Pro')}
              </Text>
              <Text small className="mt-1 text-center text-muted">
                {t('Get the full breakdown behind every prediction.')}
              </Text>
              <Button
                title={t('Upgrade to Pro')}
                onPress={() => router.push('/(app)/(user)/settings')}
                className="mt-4 w-full"
              />
            </BlurView>
          )}
        </View>

        {/* Disclaimer */}
        <View className="mt-4 flex-row items-center justify-center px-4">
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.muted} />
          <Text small className="ml-1.5 text-center text-muted">
            {t('AI-generated preview based on available match data.')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
