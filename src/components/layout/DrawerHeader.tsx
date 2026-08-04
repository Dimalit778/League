import { SettingsIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { HeaderChrome } from './HeaderChrome';

export function DrawerHeader() {
  const { colors } = useThemeTokens();

  return (
    <HeaderChrome>
      <Link href="/settings" asChild>
        <Pressable accessibilityRole="button" className="ms-auto p-1">
          <SettingsIcon size={30} color={colors.primary} />
        </Pressable>
      </Link>
    </HeaderChrome>
  );
}
