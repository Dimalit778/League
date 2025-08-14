import LeagueCard from "@/features/leagues/components/LeagueCard";
import { useMyLeagues } from "@/features/leagues/hooks/useLeagues";
import { Button, Loading } from "@/shared/components/ui";
import { router } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function Leagues() {
  const { data: leagues, isLoading, error } = useMyLeagues();

  if (isLoading) return <Loading />;
  if (error) return <Text>Error: {error.message}</Text>;

  const handleSeeLeague = (id: string) => {
    router.push(`/leagues/${id}`);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <Button
          title="Create League"
          variant="primary"
          size="md"
          onPress={() =>
            router.push("/leagues/createLeague/select-competition")
          }
        />
        <Button
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push("/leagues/join-league")}
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
          renderItem={({ item }) => (
            <LeagueCard
              item={item}
              onPress={() => handleSeeLeague(item.league_id)}
            />
          )}
        />
      </View>
    </View>
  );
}
