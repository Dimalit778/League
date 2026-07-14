import { LeagueIcon, MatchesIcon, MenuIcon, ProfileIcon, RankIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { selectLeagueId, useMemberStore } from '@/store/MemberStore';
import { Href, Link } from 'expo-router';
import { Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const leagueId = useMemberStore(selectLeagueId);

  const drawerRoutes = [
    {
      label: 'League',
      route: `/(app)/league/${leagueId}`,
      icon: LeagueIcon,
    },
    {
      label: 'Matches',
      route: `/(app)/league/${leagueId}/Matches`,
      icon: MatchesIcon,
    },
    {
      label: 'Stats',
      route: `/(app)/league/${leagueId}/Stats`,
      icon: RankIcon,
    },
    {
      label: 'Profile',
      route: `/(app)/league/${leagueId}/Profile`,
      icon: ProfileIcon,
    },
  ] as const;

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onPress={onClose}>
        {/* Drawer Content */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              width: 200,
              height: '100%',
              backgroundColor: colors.background,
              paddingTop: insets.top,
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {/* close button */}
            <TouchableOpacity onPress={onClose} className="p-4">
              <MenuIcon size={24} color={colors.primary} />
            </TouchableOpacity>
            {/* Navigation Items */}
            <View className="flex-1 pt-4 bg-secondary">
              {drawerRoutes.map((route) => {
                const IconComponent = route.icon;
                return (
                  <Link key={route.route} href={route.route as Href} asChild prefetch onPress={onClose}>
                    <TouchableOpacity
                      className="flex-row items-center gap-4 px-4 py-3 hover:bg-border"
                      onPress={onClose}
                      accessibilityRole="button"
                    >
                      <IconComponent size={24} color={colors.primary} />
                      <Text>{t(route.label)}</Text>
                    </TouchableOpacity>
                  </Link>
                );
              })}

              {/* Divider */}
              <View className="h-px bg-border mx-4 my-4" />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
