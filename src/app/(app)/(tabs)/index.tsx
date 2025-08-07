import LeagueCard from "@/components/cards/LeagueCard";
import { Loading } from "@/components/Loading";
import { ButtonC } from "@/components/ui";

import { useLeagueService } from "@/services/leagueService";
import { useAppStore } from "@/services/store/AppStore";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function MyLeagues() {
  const { getMyLeagues } = useLeagueService();
  const { setPrimaryLeague } = useAppStore();

  const {
    data: leagues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => getMyLeagues(),
  });

  if (isLoading) return <Loading />;
  if (error) return <Text>Error: {error.message}</Text>;

  const Header = () => {
    return (
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <ButtonC
          title="Create League"
          variant="primary"
          size="md"
          onPress={() => router.push("/(app)/(newLeague)/select-competition")}
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
    <View className="flex-1 bg-background">
      <Header />
      <View className="flex-grow  px-4 ">
        <FlatList
          data={leagues || []}
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
            <LeagueCard handleSetPrimary={() => {}} item={item} />
          )}
        />
      </View>
    </View>
  );
}
