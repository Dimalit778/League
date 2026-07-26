import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/LanguageStore';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';

type AiAnalysisCardProps = {
  summaryEn: string;
  summaryHe: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeTeamName: string;
  awayTeamName: string;
};

export default function AiAnalysisCard({
  summaryEn,
  summaryHe,
  predictedHomeScore,
  predictedAwayScore,
  homeTeamName,
  awayTeamName,
}: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const summary = language === 'he' ? summaryHe : summaryEn;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 32 }}
    >
      <View className="flex-1 justify-center">
        <View className="mb-4 items-center">
          <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="sparkles" size={21} color="#a78bfa" />
          </View>
          <Text h3 bold className="text-center">
            {t('AI Preview')}
          </Text>
        </View>

        <View className="rounded-2xl border border-primary/30 bg-surfaceSoft px-4 py-5">
          <Text small semibold className="mb-4 text-center uppercase tracking-wider text-muted">
            {t('Predicted Score')}
          </Text>

          <View className="flex-row items-center">
            <Text semibold numberOfLines={2} className="min-w-0 flex-1 text-center">
              {homeTeamName}
            </Text>

            <View className="mx-3 flex-row items-center rounded-xl bg-background px-4 py-2">
              <Text h1 bold className="text-primary">
                {predictedHomeScore}
              </Text>
              <Text h2 className="mx-2 text-muted">
                –
              </Text>
              <Text h1 bold className="text-primary">
                {predictedAwayScore}
              </Text>
            </View>

            <Text semibold numberOfLines={2} className="min-w-0 flex-1 text-center">
              {awayTeamName}
            </Text>
          </View>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-surface px-5 py-4">
          <View className="mb-3 flex-row items-center">
            <Ionicons name="analytics-outline" size={18} color="#a78bfa" />
            <Text semibold className="ml-2">
              {t('AI match analysis')}
            </Text>
          </View>

          <Text body className="leading-7 text-text">
            {summary}
          </Text>
        </View>

        <Text small className="mt-3 px-4 text-center text-muted">
          {t('AI-generated preview based on available match data.')}
        </Text>
      </View>
    </ScrollView>
  );
}
