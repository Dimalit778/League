// components/layout/Sidebar.tsx
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { ArrowLeftIcon, LeagueIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';
import { Href, usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, View } from 'react-native';

type SidebarRoute = {
  label: string;
  route: string;
  href: Href;
  icon: typeof LeagueIcon;
};

export function SidebarMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useThemeTokens();
  const isOpen = useSidebarStore((s) => s.isOpen);
  const closeSidebar = useSidebarStore((s) => s.closeSidebar);
  const { t } = useTranslation();
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId);
  const isWeb = Platform.OS === 'web';

  const routes: SidebarRoute[] = [
    {
      label: 'League',
      route: 'index',
      href: `/(app)/league/${leagueId}` as Href,
      icon: LeagueIcon,
    },
    {
      label: 'Matches',
      route: 'Matches',
      href: `/(app)/league/${leagueId}/Matches` as Href,
      icon: MatchesIcon,
    },
    {
      label: 'Stats',
      route: 'Stats',
      href: `/(app)/league/${leagueId}/Stats` as Href,
      icon: RankIcon,
    },
    {
      label: 'Profile',
      route: 'Profile',
      href: `/(app)/league/${leagueId}/Profile` as Href,
      icon: ProfileIcon,
    },
  ];

  const handleNavigation = (href: SidebarRoute['href']) => {
    router.push(href);
    if (isWeb) {
      closeSidebar();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Pressable
        onPress={closeSidebar}
        className="absolute inset-0 bg-black/50 "
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <View className="absolute top-0 left-0 bottom-0 w-52  z-50 bg-background">
        <View className="p-4 flex-row items-center justify-between">
          <Pressable onPress={closeSidebar} className=" ml-1 hover:bg-border rounded-lg">
            <ArrowLeftIcon size={24} color={colors.muted} />
          </Pressable>
        </View>
        <ScrollView className="flex-1">
          <View className="px-3">
            {routes.map((route) => {
              const isActive =
                route.route === 'index' ? pathname === '/' : pathname.toLowerCase().includes(route.route.toLowerCase());
              const Icon = route.icon;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(route.label)}
                  key={route.route}
                  onPress={() => handleNavigation(route.href)}
                  className={`flex-row items-center px-4 py-3 rounded-lg mb-2 ${
                    isActive ? 'bg-surface' : 'bg-transparent'
                  }`}
                >
                  <Icon size={24} color={isActive ? colors.primary : colors.muted} />
                  <Text variant="body" className={`ml-3  ${isActive ? 'text-primary' : 'text-muted'}`}>
                    {t(route.label)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
