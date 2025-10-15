import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/services/useAuth';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const statsCards = [
  { label: 'Users', key: 'users' as const, width: 'w-1/2' },
  { label: 'Leagues', key: 'leagues' as const, width: 'w-1/2' },
  { label: 'Members', key: 'leagueMembers' as const, width: 'w-1/2' },
  { label: 'Predictions', key: 'predictions' as const, width: 'w-1/2' },
  {
    label: 'Active Subscriptions',
    key: 'subscriptions' as const,
    width: 'w-full',
  },
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
    title: 'Competitions',
    description: 'Add or remove competitions from the platform.',
    route: '/competitions',
  },
];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { data, isLoading, isRefetching, refetch, error } = useAdminDashboard();
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading && !data) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <Text className="text-text text-center text-xl font-semibold mb-2">
          Platform Overview
        </Text>

        <View className="flex-row flex-wrap ">
          {statsCards.map((stat) => (
            <View key={stat.key} className={`${stat.width} px-2 my-1`}>
              <View className="bg-border border border-border rounded-xl gap-1 p-2 justify-center items-center">
                <Text className="text-muted text-md ">{stat.label}</Text>
                <Text className="text-text text-2xl font-semibold ">
                  {data?.[stat.key] ?? 0}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {navigationLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            onPress={() => router.push(link.route as any)}
            className="bg-surface border border-border rounded-2xl p-4 my-2 flex-row justify-between"
          >
            <View className="flex-1">
              <Text className="text-text text-lg font-semibold mb-2">
                {link.title}
              </Text>
              <Text className="text-muted text-sm">{link.description}</Text>
            </View>
            <View className=" items-center justify-center">
              <Entypo name="chevron-right" size={28} color={colors.text} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button title="Logout" onPress={() => signOut()} className="mx-auto" />
    </SafeAreaView>
  );
};

export default AdminDashboard;
