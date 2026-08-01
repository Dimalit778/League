import { Card, LockedBadge, Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

type MemberOptionProps = {
  value: number;
  label: string;
  locked: boolean;
  membersCount: number;
  onSelect: (value: number) => void;
  onLockedPress: () => Promise<void>;
};

export default function MemberOption({
  value,
  label,
  locked,
  membersCount,
  onSelect,
  onLockedPress,
}: MemberOptionProps) {
  const { t } = useTranslation();
  const isActive = membersCount === value;

  return (
    <Card
      onPress={async () => {
        if (locked) {
          await onLockedPress();
          return;
        }
        onSelect(value);
      }}
      padding="none"
      className="flex-1 mx-1 border-0"
    >
      <View className="relative overflow-hidden rounded-2xl">
        <View
          className={`rounded-2xl border px-4 py-4 ${isActive ? 'border-primary bg-surface' : 'border-border bg-background'}`}
        >
          <Text className={`text-base text-center font-semibold ${isActive ? 'text-primary' : 'text-text'}`}>
            {t(label)}
          </Text>
        </View>
        <LockedBadge visible={locked} />
      </View>
    </Card>
  );
}
