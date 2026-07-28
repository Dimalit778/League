import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { Pressable, ScrollView } from 'react-native';
import { WCKnockoutStage } from '../types';

const STAGES: { key: WCKnockoutStage; label: string }[] = [
  { key: 'ROUND_OF_16', label: 'Round of 16' },
  { key: 'QUARTER_FINAL', label: 'Quarter Finals' },
  { key: 'SEMI_FINAL', label: 'Semi Finals' },
  { key: 'FINAL', label: 'Final' },
];

type Props = {
  selected: WCKnockoutStage;
  onSelect: (stage: WCKnockoutStage) => void;
};

export default function KnockoutStageTabs({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      {STAGES.map((s) => {
        const active = selected === s.key;
        return (
          <Pressable
            key={s.key}
            onPress={() => onSelect(s.key)}
            className={cn(
              'rounded-lg justify-center items-center mx-1 px-4 py-1.5',
              active ? 'bg-primary' : 'border border-border'
            )}
          >
            <Text className={`text-base font-bold ${active ? 'text-background' : 'text-text'}`}>
              {t(s.label)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
