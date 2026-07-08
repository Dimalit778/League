import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/LanguageStore';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

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
    <View className="mx-4 mt-4 rounded-2xl bg-surface border border-border p-4 gap-3">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <Ionicons name="sparkles" size={18} color="#a78bfa" />
        <Text variant="bodyBold" className="text-primary">
          {t('AI Preview')}
        </Text>
      </View>

      {/* Summary */}
      <Text variant="body" className="text-text leading-6">
        {summary}
      </Text>

      {/* Predicted score chip */}
      <View className="flex-row items-center gap-2 mt-1">
        <Text variant="caption" className="text-muted">
          {t('Prediction:')}
        </Text>
        <View className="flex-row items-center bg-primary/10 rounded-lg px-3 py-1 gap-1">
          <Text variant="bodyBold" className="text-primary">
            {homeTeamName} {predictedHomeScore} – {predictedAwayScore} {awayTeamName}
          </Text>
        </View>
      </View>
    </View>
  );
}
