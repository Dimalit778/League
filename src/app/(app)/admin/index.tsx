import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const navigationLinks = [
  {
    title: 'User Management',
    description: 'Review registered users and account details.',
    route: '/admin/users',
  },
  {
    title: 'League Management',
    description: 'Manage leagues and their metadata.',
    route: '/admin/leagues',
  },
  {
    title: 'League Members',
    description: 'Inspect members across every league.',
    route: '/admin/league-members',
  },
  {
    title: 'Predictions',
    description: 'Audit recent predictions submitted by users.',
    route: '/admin/predictions',
  },
  {
    title: 'Competitions',
    description: 'Add or remove competitions from the platform.',
    route: '/admin/competitions',
  },
];

const AdminDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch, error } = useAdminDashboard();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Admin Dashboard" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
          <Text className="text-text text-xl font-semibold mb-4">
            Platform Overview
          </Text>
          {error ? (
            <Text className="text-error text-base">
              Failed to load dashboard data. Pull to refresh to try again.
            </Text>
          ) : (
            <View className="flex-row flex-wrap -mx-2">
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-background border border-border rounded-xl p-4">
                  <Text className="text-text/70 text-sm">Users</Text>
                  <Text className="text-text text-2xl font-semibold">
                    {data?.users ?? 0}
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-background border border-border rounded-xl p-4">
                  <Text className="text-text/70 text-sm">Leagues</Text>
                  <Text className="text-text text-2xl font-semibold">
                    {data?.leagues ?? 0}
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-background border border-border rounded-xl p-4">
                  <Text className="text-text/70 text-sm">League Members</Text>
                  <Text className="text-text text-2xl font-semibold">
                    {data?.leagueMembers ?? 0}
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-2 mb-4">
                <View className="bg-background border border-border rounded-xl p-4">
                  <Text className="text-text/70 text-sm">Predictions</Text>
                  <Text className="text-text text-2xl font-semibold">
                    {data?.predictions ?? 0}
                  </Text>
                </View>
              </View>
              <View className="w-full px-2">
                <View className="bg-background border border-border rounded-xl p-4">
                  <Text className="text-text/70 text-sm">Active Subscriptions</Text>
                  <Text className="text-text text-2xl font-semibold">
                    {data?.subscriptions ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <Text className="text-text text-xl font-semibold mb-3">
          Administrative Areas
        </Text>
        <View className="space-y-4 mb-16">
          {navigationLinks.map((link) => (
            <TouchableOpacity
              key={link.route}
              onPress={() => router.push(link.route)}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <Text className="text-text text-lg font-semibold mb-2">
                {link.title}
              </Text>
              <Text className="text-text/70 text-sm">{link.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
