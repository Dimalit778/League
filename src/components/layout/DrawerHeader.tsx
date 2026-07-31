import { MenuIcon, SettingsIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useSidebarStore } from '@/store/SidebarStore';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { HeaderChrome } from './HeaderChrome';

/** Hamburger that opens the web sidebar / drawer. */
export function DrawerToggleButton() {
  const { colors } = useThemeTokens();
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  return (
    <Pressable
      onPress={toggleSidebar}
      accessibilityRole="button"
      accessibilityLabel="Toggle menu"
      className="-ml-2 rounded-lg p-2 hover:bg-border"
    >
      <MenuIcon size={24} color={colors.primary} />
    </Pressable>
  );
}

/** Header for drawer / non-tabs contexts (settings shortcut). */
export function DrawerHeader() {
  const { colors } = useThemeTokens();

  return (
    <HeaderChrome>
      <DrawerToggleButton />
      <Link href="/settings" asChild>
        <Pressable accessibilityRole="button" className="ml-auto p-1">
          <SettingsIcon size={30} color={colors.primary} />
        </Pressable>
      </Link>
    </HeaderChrome>
  );
}
