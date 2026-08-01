import { Chip } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollView } from 'react-native';
import { GROUP_LIST } from '../mock/groups';
import { WCGroup } from '../types';

type Props = {
  selected: WCGroup;
  onSelect: (group: WCGroup) => void;
};

export default function GroupTabs({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      {GROUP_LIST.map((g) => {
        const active = selected === g;
        return (
          <Chip
            key={g}
            onPress={() => onSelect(g)}
            label={`${t('Group')} ${g}`}
            variant={active ? 'selected' : 'default'}
            className="mx-1 min-w-[60px]"
          />
        );
      })}
    </ScrollView>
  );
}
