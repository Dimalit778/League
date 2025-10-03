import { useThemeStore } from '@/store/ThemeStore';
import React from 'react';
import { View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;

  safeAreaMode?: 'tabs' | 'header' | 'full' | Edge[];
};

const Screen = ({
  children,
  className,
  safeAreaMode = 'full',
}: ScreenProps) => {
  const getColor = useThemeStore((state) => state.getColor);

  const getEdges = (): Edge[] => {
    switch (safeAreaMode) {
      case 'tabs':
        return ['left', 'right'];
      case 'header':
        return ['left', 'right', 'bottom'];
      case 'full':
        return ['top', 'left', 'right', 'bottom'];
      default:
        return safeAreaMode;
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={getEdges()}
      style={{
        backgroundColor: getColor('background'), // Fallback for immediate theme application
      }}
    >
      <View style={{ flex: 1 }} className={className}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
