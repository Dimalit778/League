import { useThemeTokens } from '@/hooks/useThemeTokens';
import { BlurView } from 'expo-blur';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';

type HeaderChromeProps = {
  children: ReactNode;
};

/** Shared blur / elevation shell for native tab & drawer headers. */
export function HeaderChrome({ children }: HeaderChromeProps) {
  const { colors, theme } = useThemeTokens();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row items-center px-4 pb-2">{children}</View>
    </View>
  );

  if (isIOS) {
    return (
      <BlurView
        intensity={80}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[styles.iosContainer, { borderBottomColor: colors.surface }]}
      >
        {content}
      </BlurView>
    );
  }

  return <View style={[styles.androidContainer, { backgroundColor: colors.background }]}>{content}</View>;
}

const styles = StyleSheet.create({
  iosContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  androidContainer: {
    elevation: 4,
    shadowColor: '#000',
  },
});
