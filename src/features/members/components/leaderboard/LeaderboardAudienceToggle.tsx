import { Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { Pressable } from 'react-native';

export type LeaderboardAudience = 'friends' | 'world';

type Props = {
  value: LeaderboardAudience;
  onChange: (audience: LeaderboardAudience) => void;
};

const OPTIONS: { audience: LeaderboardAudience; label: string }[] = [
  { audience: 'friends', label: 'Friends' },
  { audience: 'world', label: 'World' },
];

export function LeaderboardAudienceToggle({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Row className="self-center gap-1 rounded-full border border-border bg-surface/60 p-0.5">
      {OPTIONS.map(({ audience, label }) => {
        const active = value === audience;
        return (
          <Pressable
            key={audience}
            onPress={() => onChange(audience)}
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
