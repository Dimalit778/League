import { Text } from '@/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Slot, usePathname, useRouter } from 'expo-router';
import {
  CircleUserRound,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, FlatList, useWindowDimensions, View } from 'react-native';

const navigationItems = [
  { label: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: CircleUserRound },
  { label: 'League Management', href: '/admin/leagues', icon: Trophy },
  { label: 'League Members', href: '/admin/league-members', icon: UsersRound },
  { label: 'Predictions', href: '/admin/predictions', icon: Target },
  { label: 'Content Reports', href: '/admin/reports', icon: ShieldCheck },
  { label: 'Competitions', href: '/admin/competitions', icon: ClipboardCheck },
] as const;

const AdminWebShell = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useThemeTokens();
  const { t, isRTL } = useTranslation();
  const { signOut, isLoading } = useAuthActions();
  const isCompact = width < 1100;

  const activeItem =
    navigationItems.find(({ href }) =>
      href === '/admin' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href),
    ) ?? navigationItems[0];

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) router.replace('/');
  };

  const renderNavItem = useCallback(
    ({ item }: { item: (typeof navigationItems)[number] }) => {
      const { label, href, icon: Icon } = item;
      const isActive =
        href === '/admin' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href);

      return (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t(label)}
          accessibilityState={{ selected: isActive }}
          onPress={() => router.push(href as never)}
          className={`min-h-12 flex-row items-center rounded-xl px-3 ${isActive ? 'bg-primary' : 'hover:bg-subtle'}`}
          style={{ justifyContent: isCompact ? 'center' : 'flex-start', gap: isCompact ? 0 : 12 }}
        >
          <Icon size={20} color={isActive ? colors.onPrimary : colors.muted} strokeWidth={isActive ? 2.2 : 1.9} />
          {!isCompact ? (
            <Text variant="bodySmall" tone={isActive ? 'inverse' : 'default'} className="font-semibold">
              {t(label)}
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [colors.muted, colors.onPrimary, isCompact, pathname, router, t],
  );

  return (
    <View className="flex-1 bg-background" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <View
        className="bg-surface"
        style={[
          { width: isCompact ? 88 : 272 },
          isRTL ? { borderLeftColor: colors.border, borderLeftWidth: 1 } : { borderRightColor: colors.border, borderRightWidth: 1 },
        ]}
      >
        <View className="h-20 flex-row items-center gap-3 border-b border-border px-5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck size={21} color={colors.onPrimary} strokeWidth={2.2} />
          </View>
          {!isCompact ? (
            <View>
              <Text variant="subtitle" ltr>
                CHAMPO
              </Text>
              <Text variant="caption" tone="muted">
                {t('Admin')}
              </Text>
            </View>
          ) : null}
        </View>

        <FlatList
          data={[...navigationItems]}
          keyExtractor={(item) => item.href}
          extraData={`${pathname}-${isCompact}`}
          className="flex-1"
          contentContainerClassName="gap-1.5 p-3"
          showsVerticalScrollIndicator={false}
          renderItem={renderNavItem}
        />

        <View className="border-t border-border p-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Sign Out')}
            disabled={isLoading}
            onPress={() => void handleSignOut()}
            className="min-h-12 flex-row items-center rounded-xl px-3 hover:bg-subtle"
            style={{ justifyContent: isCompact ? 'center' : 'flex-start', gap: isCompact ? 0 : 12, opacity: isLoading ? 0.5 : 1 }}
          >
            <LogOut size={20} color={colors.muted} strokeWidth={1.9} />
            {!isCompact ? (
              <Text variant="bodySmall" tone="muted" className="font-semibold">
                {t('Sign Out')}
              </Text>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="h-20 flex-row items-center justify-between border-b border-border bg-surface px-6 lg:px-8">
          <View>
            <Text variant="caption" tone="muted">
              {t('Admin')}
            </Text>
            <Text variant="title">{t(activeItem.label)}</Text>
          </View>
          <View className="rounded-full border border-border bg-subtle px-3 py-1.5">
            <Text variant="caption" tone="muted">
              {t('Management areas')}
            </Text>
          </View>
        </View>
        <View className="min-h-0 flex-1">
          <Slot />
        </View>
      </View>
    </View>
  );
};

export default AdminWebShell;
