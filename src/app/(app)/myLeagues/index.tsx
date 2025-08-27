import { Error, LoadingOverlay, Screen, TopBar } from '@/components/layout';

import LeagueCard from '@/components/myLeagues/LeagueCard';
import { Button } from '@/components/ui';
import { useMyLeagues } from '@/hooks/useLeagues';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

export default function MyLeagues() {
  const { data: leagues, isLoading, error } = useMyLeagues();

  if (error) return <Error error={error} />;

  return (
    <Screen>
      <TopBar showLeagueName={false} />
      {isLoading && <LoadingOverlay />}

      <View className="flex-row justify-between my-4 px-3">
        <Button
          title="Create League"
          variant="secondary"
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

      <FlatList
        data={leagues}
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
    </Screen>
  );
}
