import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

type SettingsRowProps = {
  icon: ReactNode;
  label: string;
  rightContent?: ReactNode;
  showDivider?: boolean;
  onPress?: () => void;
};

const SettingsRow = ({ icon, label, rightContent, showDivider = true, onPress }: SettingsRowProps) => {
  const content = (
    <>
      <View className="h-14 flex-row items-center justify-between px-3">
        <View className="flex-row items-center gap-3">
          <View className="items-center justify-center bg-surfaceSecondary rounded-md p-2">{icon}</View>
          <Text>{label}</Text>
        </View>

        <Text className="text-muted">{rightContent}</Text>
      </View>

      {showDivider && <View className="h-px bg-border " />}
    </>
  );

  if (!onPress) {
    return <View>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-60" accessibilityRole="button">
      {content}
    </Pressable>
  );
};

export default SettingsRow;
