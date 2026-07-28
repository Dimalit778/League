import { useThemeTokens } from '@/hooks/useThemeTokens';
import { router } from 'expo-router';
import { Settings, Trophy } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MobileTopBarProps = {
  /** Optional content rendered between Settings (left) and Leagues (right). */
  center?: React.ReactNode;
  className?: string;
};

function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surfaceSoft"
      hitSlop={4}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

export function TopTabBar({ center, className = '' }: MobileTopBarProps) {
  const { colors } = useThemeTokens();
  const { top } = useSafeAreaInsets();

  return (
    <View className={`w-full flex-row items-center px-3 ${className}`} style={{ paddingTop: top }}>
      <IconButton label="Settings" onPress={() => router.push('/(app)/(user)/settings')}>
        <Settings color={colors.text} size={25} strokeWidth={1.5} />
      </IconButton>

      <View className="flex-1 items-center justify-center">{center}</View>

      <IconButton label="My leagues" onPress={() => router.replace('/(app)/(user)/leagues/my-leagues')}>
        <Trophy color={colors.text} size={25} strokeWidth={1.5} />
      </IconButton>
    </View>
  );
}
