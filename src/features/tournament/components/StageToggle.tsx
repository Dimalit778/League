import { Chip } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

type View_ = 'groups' | 'knockout';

type Props = {
  value: View_;
  onChange: (value: View_) => void;
};

const Item = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
  <Chip onPress={onPress} label={label} variant={active ? 'selected' : 'default'} className="flex-1 border-0" />
);

export default function StageToggle({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-row p-1 mx-3 my-2 rounded-xl bg-surface border border-border">
      <Item active={value === 'groups'} label={t('Groups')} onPress={() => onChange('groups')} />
      <Item active={value === 'knockout'} label={t('Knockout')} onPress={() => onChange('knockout')} />
    </View>
  );
}
