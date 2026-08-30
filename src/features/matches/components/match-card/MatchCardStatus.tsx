import { Text } from '@/components';
import type { MatchUiStatus } from '../../model/matchPresentation';
import { View } from 'react-native';

export function MatchCardStatus({ status, top }: { status: MatchUiStatus; top: number }) {
  return (
    <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
      <Text variant="body" size={status.label === 'LIVE' || status.label === 'FT' ? 'sm' : 'xs'} tone={status.tone} numberOfLines={1}>
        {status.label}
      </Text>
    </View>
  );
}
