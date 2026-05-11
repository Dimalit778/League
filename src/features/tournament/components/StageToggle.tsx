import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { Pressable, View } from 'react-native';

type View_ = 'groups' | 'knockout';

type Props = {
  value: View_;
  onChange: (value: View_) => void;
};

const Item = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className={cn('flex-1 py-2 rounded-lg items-center', active ? 'bg-primary' : '')}>
    <CText variant="bodyBold" className={active ? 'text-background' : 'text-text'}>
      {label}
    </CText>
  </Pressable>
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
