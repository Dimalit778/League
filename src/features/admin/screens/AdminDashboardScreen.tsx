import { Button, Card, Error, LoadingOverlay, Screen, Text } from '@/components';
import {
  AdminGridItem,
  AdminMetricCard,
  AdminPageHeader,
} from '@/features/admin/components/AdminUI';
import { ADMIN_CONTENT_CLASS } from '@/features/admin/lib/adminUi';
import { useAdminDashboard } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Crown,
  LogOut,
  ShieldAlert,
  Target,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';

const statsCards = [
  { label: 'Users', key: 'users' as const, icon: CircleUserRound },
  { label: 'Leagues', key: 'leagues' as const, icon: Trophy },
  { label: 'Members', key: 'leagueMembers' as const, icon: UsersRound },
  { label: 'Predictions', key: 'predictions' as const, icon: Target },
  { label: 'Active Subscriptions', key: 'subscriptions' as const, icon: Crown },
  { label: 'Pending Reports', key: 'pendingReports' as const, icon: ShieldAlert, emphasis: 'warning' as const },
];

const navigationLinks = [
  { title: 'User Management', description: 'Review registered users and account details.', route: '/admin/users', icon: UserRound },
  { title: 'League Management', description: 'Manage leagues and their metadata.', route: '/admin/leagues', icon: Trophy },
  { title: 'League Members', description: 'Inspect members across every league.', route: '/admin/league-members', icon: UsersRound },
  { title: 'Predictions', description: 'Audit recent predictions submitted by users.', route: '/admin/predictions', icon: Target },
  {
    title: 'Content Reports',
    description: 'Review reported nicknames, profile photos and league names.',
    route: '/admin/reports',
    icon: ShieldAlert,
  },
  {
    title: 'Competitions',
    description: 'Add or remove competitions from the platform.',
    route: '/admin/competitions',
    icon: ClipboardCheck,
  },
];

const AdminDashboardScreen = () => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, isRTL } = useTranslation();
  const isFocused = useIsFocused();
  const { data, isLoading, isRefetching, refetch, error } = useAdminDashboard();
  const onRefresh = useCallback(() => void refetch(), [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading && !data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={isFocused && (isLoading || isRefetching)}
            onRefresh={onRefresh}
          />
        }
      >
        <View className={ADMIN_CONTENT_CLASS}>
          <AdminPageHeader
            eyebrow={t('ADMIN')}
            title={t('Platform Overview')}
            description={t('Monitor platform health and jump directly into the work that needs attention.')}
          />

          <View className="-mx-1.5 mb-6 flex-row flex-wrap">
            {statsCards.map((stat) => (
              <View key={stat.key} className="w-1/2 p-1.5 md:w-1/3 lg:w-1/6">
                <AdminMetricCard
                  label={t(stat.label)}
                  value={data?.[stat.key] ?? 0}
                  icon={stat.icon}
                  emphasis={stat.emphasis}
                />
              </View>
            ))}
          </View>

          <View className="mb-2 flex-row items-end justify-between gap-3">
            <View>
              <Text variant="title">{t('Management areas')}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('Choose an area to review or manage.')}
              </Text>
            </View>
          </View>

          <View className="-mx-1.5 flex-row flex-wrap">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const Chevron = isRTL ? ChevronLeft : ChevronRight;
              return (
                <AdminGridItem key={link.route}>
                  <Card
                    onPress={() => router.push(link.route as never)}
                    contentClassName="min-h-[96px] flex-row items-center gap-4"
                  >
                    <View className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-subtle">
                      <Icon size={21} color={colors.primary} strokeWidth={1.8} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text variant="subtitle" numberOfLines={1}>
                        {t(link.title)}
                      </Text>
                      <Text variant="caption" tone="muted" className="mt-1" numberOfLines={2}>
                        {t(link.description)}
                      </Text>
                    </View>
                    <Chevron size={19} color={colors.muted} />
                  </Card>
                </AdminGridItem>
              );
            })}
          </View>

          {Platform.OS !== 'web' ? (
            <View className="mt-7 items-start border-t border-border pt-5">
              <Button
                label={t('Logout')}
                variant="outline"
                size="sm"
                leftIcon={<LogOut size={17} color={colors.text} />}
                onPress={() => signOut()}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AdminDashboardScreen;
