import LeagueCard from "@/components/cards/LeagueCard";
import { Loading } from "@/components/Loading";
import { ButtonC } from "@/components/ui";
import { useMyLeagues, useSetPrimaryLeague } from "@/hooks/useQueries";
import { router } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function MyLeagues() {
  const { data: leagues, isLoading, error } = useMyLeagues();
  const setPrimaryLeagueMutation = useSetPrimaryLeague();

  const handleSetPrimary = (leagueId: string) => {
    setPrimaryLeagueMutation.mutate(leagueId);
  };

  if (isLoading) return <Loading />;

  if (error) {
    console.error("Error getting leagues:", error);
  }

  const Header = () => {
    return (
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <ButtonC
          title="Create League"
          variant="primary"
          size="md"
          onPress={() => router.push("/(app)/(newLeague)/create-league")}
        />
        <ButtonC
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push("/(app)/(newLeague)/join-league")}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-600">
      <Header />
      <View className="flex-grow  px-4 ">
        <FlatList
          data={leagues?.data || []}
          contentContainerStyle={{ flexGrow: 1, gap: 15, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-grow justify-center items-center">
              <Text className="text-black text-2xl font-bold">
                Create or Join a League
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <LeagueCard handleSetPrimary={handleSetPrimary} item={item} />
          )}
        />
      </View>
    </View>
  );
}
