import { Text } from '@/components';
import type { MatchPresentation } from '../../model/matchPresentation';
import { View } from 'react-native';

export function MatchCardStatus({ presentation, date, top }: { presentation: MatchPresentation; date: string; top: number }) {
  return (
    <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
      {presentation.cardStatusLabel ? (
        <Text
          variant="bodySmall"
          tone={presentation.cardStatusLabel === 'LIVE' ? 'success' : 'default'}
          numberOfLines={1}
        >
          {presentation.cardStatusLabel}
        </Text>
      ) : (
        <Text variant="caption" tone="muted">
          {date}
        </Text>
      )}
    </View>
  );
}
