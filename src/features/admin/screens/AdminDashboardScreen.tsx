import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { Button, Card, Text } from '@/components/ui';
import { useAdminDashboard } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import Entypo from '@expo/vector-icons/Entypo';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

const statsCards = [
  { label: 'Users', key: 'users' as const, width: 'w-1/2' },
  { label: 'Leagues', key: 'leagues' as const, width: 'w-1/2' },
  { label: 'Members', key: 'leagueMembers' as const, width: 'w-1/2' },
  { label: 'Predictions', key: 'predictions' as const, width: 'w-1/2' },
  {
    label: 'Active Subscriptions',
    key: 'subscriptions' as const,
    width: 'w-1/2',
  },
  { label: 'Pending Reports', key: 'pendingReports' as const, width: 'w-1/2' },
];

const navigationLinks = [
  {
    title: 'User Management',
    description: 'Review registered users and account details.',
    route: '/users',
  },
  {
    title: 'League Management',
    description: 'Manage leagues and their metadata.',
    route: '/leagues',
  },
  {
    title: 'League Members',
    description: 'Inspect members across every league.',
    route: '/league-members',
  },
  {
    title: 'Predictions',
    description: 'Audit recent predictions submitted by users.',
    route: '/predictions',
  },
  {
    title: 'Content Reports',
    description: 'Review reported nicknames, profile photos and league names.',
    route: '/reports',
  },
  {
    title: 'Competitions',
    description: 'Add or remove competitions from the platform.',
    route: '/competitions',
  },
];

const AdminDashboardScreen = () => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { data, isLoading, isRefetching, refetch, error } = useAdminDashboard();
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading && !data) return <LoadingOverlay />;

  return (
    <Screen safeArea>
      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        <Text className="text-text text-center text-xl font-semibold mb-2">{t('Platform Overview')}</Text>

        <View className="flex-row flex-wrap ">
          {statsCards.map((stat) => (
            <View key={stat.key} className={`${stat.width} px-2 my-1`}>
              <Card variant="soft" padding="sm" className="gap-1 items-center">
                <Text className="text-muted text-md ">{t(stat.label)}</Text>
                <Text className="text-text text-2xl font-semibold ">{data?.[stat.key] ?? 0}</Text>
              </Card>
            </View>
          ))}
        </View>

        {navigationLinks.map((link) => (
          <Card
            key={link.route}
            onPress={() => router.push(link.route as any)}
            variant="interactive"
            className="my-2"
            contentClassName="flex-row justify-between"
          >
            <View className="flex-1">
              <Text className="text-text text-lg font-semibold mb-2">{t(link.title)}</Text>
              <Text className="text-muted text-sm">{t(link.description)}</Text>
            </View>
            <View className=" items-center justify-center">
              <Entypo name="chevron-right" size={28} color={colors.text} />
            </View>
          </Card>
        ))}
      </ScrollView>
      <Button label={t('Logout')} onPress={() => signOut()} className="mx-auto" />
    </Screen>
  );
};

export default AdminDashboardScreen;
