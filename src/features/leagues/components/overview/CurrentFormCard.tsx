import { Text } from '@/components/ui';
import { RecentFormEntry } from '@/features/members/types/stats.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

type CurrentFormCardProps = {
  results?: RecentFormEntry[];
};

const resultStyles = {
  L: { backgroundColor: 'rgba(248,113,113,0.14)', borderColor: '#F87171', color: '#F87171' },
  H: { backgroundColor: 'rgba(214,162,30,0.14)', borderColor: '#D6A21E', color: '#D6A21E' },
  B: { backgroundColor: 'rgba(74,222,128,0.14)', borderColor: '#4ADE80', color: '#4ADE80' },
} as const;

export function CurrentFormCard({ results = [] }: CurrentFormCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const totalPoints = results.reduce((sum, result) => sum + result.points, 0);

  return (
    <View className="gap-2">
      <Text semibold>{t('Current form')}</Text>

      <View className="rounded-2xl border border-border bg-surface px-4 py-4">
        <View className="flex-row items-center">
          <View className="min-w-0 flex-1">
            <Text small className="mb-3 text-muted">
              {t('Last 5 finished predictions')}
            </Text>

            <View className="flex-row gap-2">
              {results.length > 0 ? (
                results.map((result, index) => {
                  const style = resultStyles[result.result];

                  return (
                    <View
                      key={`${result.result}-${index}`}
                      className="h-10 w-10 items-center justify-center rounded-xl border"
                      style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor }}
                      accessibilityLabel={`${result.result}, ${result.points} ${t('Points')}`}
                    >
                      <Text bold style={{ color: style.color }}>
                        {result.result}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text small className="text-muted">
                  {t('No finished predictions yet')}
                </Text>
              )}
            </View>
          </View>

          <View className="mx-3 h-16 w-px bg-border" />

          <View className="min-w-14 items-center">
            <Text h2 bold style={{ color: colors.primary }}>
              {totalPoints}
            </Text>
            <Text small className="text-center text-muted">
              {t('Points')}
            </Text>
          </View>
        </View>

        {results.length > 0 ? (
          <View className="mt-3 flex-row items-center border-t border-border pt-3">
            <Text small className="text-muted">
              <Text small bold style={{ color: resultStyles.L.color }}>
                L
              </Text>{' '}
              {t('Missed')}
              {'   '}
              <Text small bold style={{ color: resultStyles.H.color }}>
                H
              </Text>{' '}
              {t('Hits')}
              {'   '}
              <Text small bold style={{ color: resultStyles.B.color }}>
                B
              </Text>{' '}
              {t('Bingo')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
