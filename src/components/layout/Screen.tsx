import { useThemeStore } from '@/store/ThemeStore';
import React from 'react';
import { SafeAreaView, View } from 'react-native';

const Screen = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useThemeStore();

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      // style={{ paddingTop: Constants.statusBarHeight }}
    >
      <View style={{ flex: 1 }} className={className}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
