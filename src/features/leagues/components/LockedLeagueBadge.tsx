import React from 'react';
import { View, Text } from 'react-native';
import { LockedReason } from '@/features/subscription/types';

type Props = {
  lockedReason?: LockedReason | null;
};

export const LockedLeagueBadge = ({ lockedReason }: Props) => {
  if (!lockedReason) return null;
  return (
    <View className="flex-row items-center gap-1 bg-orange-100 border border-orange-300 rounded-full px-2 py-0.5">
      <Text className="text-xs text-orange-700 font-medium">🔒 Locked</Text>
    </View>
  );
};
