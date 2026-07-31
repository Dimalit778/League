import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { Pressable, ScrollView } from 'react-native';
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
          <Pressable
            key={g}
            onPress={() => onSelect(g)}
            className={cn(
              'rounded-lg justify-center items-center mx-1 px-4 py-1.5 min-w-[60px]',
              active ? 'bg-primary' : 'border border-border',
            )}
          >
            <Text className={`text-base font-bold ${active ? 'text-background' : 'text-text'}`}>
              {t('Group')} {g}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
