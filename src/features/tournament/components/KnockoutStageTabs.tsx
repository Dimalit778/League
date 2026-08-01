import { Chip } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollView } from 'react-native';
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
          <Chip
            key={s.key}
            onPress={() => onSelect(s.key)}
            label={t(s.label)}
            variant={active ? 'selected' : 'default'}
            className="mx-1"
          />
        );
      })}
    </ScrollView>
  );
}
