import { useThemeStore } from '@/store/ThemeStore';
import { themes } from '@/styles/themes';
import React from 'react';
import { View } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme } = useThemeStore();

  return (
    <View className="flex-1" style={[themes[theme]]}>
      {children}
    </View>
  );
};
