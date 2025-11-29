import { themes } from '@/lib/nativeWind';
import { useThemeStore } from '@/store/ThemeStore';
import { View } from 'react-native';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore((state) => state.theme);
  return (
    <View className="flex-1" style={[themes[theme]]}>
      {children}
    </View>
  );
};
