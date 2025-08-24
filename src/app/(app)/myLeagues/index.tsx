import { LoadingOverlay } from '@/components/layout';
import LeagueCard from '@/components/myLeagues/LeagueCard';
import { Button } from '@/components/ui';
import { useMyLeagues } from '@/hooks/useLeagues';
import { useAuthStore } from '@/store/AuthStore';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

export default function MyLeagues() {
  const { user } = useAuthStore();
  const { data: leagues, isLoading, error } = useMyLeagues(user?.id!);

  if (error) console.log('error---', error);

  return (
    <View className="flex-1 bg-background">
      {isLoading && <LoadingOverlay />}
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <Button
          title="Create League"
          variant="primary"
          size="md"
          onPress={() => router.push('/myLeagues/select-competition')}
        />
        <Button
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/join-league')}
        />
      </View>
      <View className="flex-grow  px-4 ">
        <FlatList
          data={leagues}
          contentContainerStyle={{ flexGrow: 1, gap: 15, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-grow justify-center items-center">
              <Text className="text-text text-2xl font-bold">
                Create or Join a League
              </Text>
            </View>
          }
          renderItem={({ item }) => <LeagueCard item={item} />}
        />
      </View>
    </View>
  );
}
