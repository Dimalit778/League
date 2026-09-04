import { Text } from '@/components';
import type { TextTone } from '@/components/ui/Text';
import { View } from 'react-native';

export function MatchCardStatus({
  label,
  tone,
  top,
  emphasize = false,
}: {
  label: string;
  tone: TextTone;
  top: number;
  emphasize?: boolean;
}) {
  return (
    <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
      <Text size="sm" weight={emphasize ? 'bold' : undefined} tone={tone}>
        {label}
      </Text>
    </View>
  );
}
