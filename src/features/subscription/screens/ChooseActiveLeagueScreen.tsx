import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

export const ChooseActiveLeagueScreen = () => {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const { data: leagues = [], isLoading } = useMyLeagues();
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!userId) {
    return null;
  }

  const ownedLeagues = leagues.filter((l) => l.league.owner_id === userId);

  const handleChoose = async (leagueId: string) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any).rpc('choose_active_league', { p_league_id: leagueId });
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) });
      router.replace('/(app)/(public)/myLeagues');
    } catch {
      Alert.alert('Error', 'Failed to update leagues. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-900 mb-2">Choose your active league</Text>
      <Text className="text-sm text-gray-500 mb-6">
        Free users can keep 1 custom league active. Select the league you want to keep.
      </Text>
      <FlatList
        data={ownedLeagues}
        keyExtractor={(item) => item.league_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            onPress={() => handleChoose(item.league_id)}
            disabled={saving}
            activeOpacity={0.7}
          >
            <View className="flex-1 mr-3">
              <Text className="font-semibold text-gray-900">{item.league.name}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{item.league.competition?.name}</Text>
            </View>
            <Text className={`text-blue-600 font-medium text-sm${saving ? ' opacity-50' : ''}`}>Keep active</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-500 mt-8">No owned leagues found.</Text>}
      />
    </View>
  );
};
