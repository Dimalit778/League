import { Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { Pressable } from 'react-native';

export type LeaderboardScope = 'round' | 'season';

type Props = {
  value: LeaderboardScope;
  onChange: (scope: LeaderboardScope) => void;
};

const OPTIONS: { scope: LeaderboardScope; label: string }[] = [
  { scope: 'round', label: 'Round' },
  { scope: 'season', label: 'All season' },
];

export function LeaderboardScopeToggle({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Row className="self-center gap-1 rounded-full border border-border bg-surface/60 p-0.5">
      {OPTIONS.map(({ scope, label }) => {
        const active = value === scope;
        return (
          <Pressable
            key={scope}
            onPress={() => onChange(scope)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(label)}
            className={cn('min-w-[104px] items-center rounded-full px-4 py-2', active && 'bg-muted')}
          >
            <Text variant="label" className={cn('font-semibold', active ? 'text-onPrimary' : 'text-muted')}>
              {t(label)}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}
