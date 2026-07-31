import { useThemeTokens } from '@/hooks/useThemeTokens';
import { LockIcon } from 'lucide-react-native';
import { View } from 'react-native';
export function LockedBadge({ visible }: { visible: boolean }) {
  const { colors } = useThemeTokens();

  if (!visible) return null;

  return (
    <View pointerEvents="none" className="absolute inset-0 z-50 items-center justify-center bg-overlay overflow-hidden">
      <View
        className="h-10 w-10 items-center justify-center rounded-full overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.error,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        }}
      >
        <LockIcon size={20} color={colors.error} strokeWidth={2.5} />
      </View>
    </View>
  );
}
