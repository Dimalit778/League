import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { LeagueIcon, MatchesIcon, MenuIcon, ProfileIcon, RankIcon } from '@assets/icons';
import { Link, RelativePathString } from 'expo-router';
import React from 'react';
import { Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CText } from '../ui';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_ROUTES = [
  {
    label: 'League',
    route: '/(app)/(member)/(tabs)/League',
    icon: LeagueIcon,
  },
  {
    label: 'Matches',
    route: '/(app)/(member)/(tabs)/Matches',
    icon: MatchesIcon,
  },
  {
    label: 'Stats',
    route: '/(app)/(member)/(tabs)/Stats',
    icon: RankIcon,
  },
  {
    label: 'Profile',
    route: '/(app)/(member)/(tabs)/Profile',
    icon: ProfileIcon,
  },
];

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
              {DRAWER_ROUTES.map((route) => {
                const IconComponent = route.icon;
                return (
                  <Link key={route.route} href={route.route as RelativePathString} asChild>
                    <TouchableOpacity
                      className="flex-row items-center gap-4 px-4 py-3 hover:bg-border"
                      onPress={onClose}
                      accessibilityRole="button"
                    >
                      <IconComponent size={24} color={colors.primary} />
                      <CText variant="bodyBold">{t(route.label)}</CText>
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
};
