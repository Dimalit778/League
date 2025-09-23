import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
};
const Screen = ({ children, className }: ScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <View style={{ flex: 1 }} className={className}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
