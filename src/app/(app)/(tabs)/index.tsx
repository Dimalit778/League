import LeagueCard from "@/components/LeagueCard";
import { Button } from "@/components/ui/ButtonC";
import { useLeagueService } from "@/services/leagueService";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function MyLeagues() {
  const { getMyLeagues, setPrimaryLeague } = useLeagueService();
  const [leagues, setLeagues] = useState<any[]>([]);

  const getLeagues = async () => {
    const { data, error } = await getMyLeagues();
    if (error) {
      console.error("Error getting leagues:", error);
    } else {
      setLeagues(data as any);
    }
  };
  console.log("leagues", JSON.stringify(leagues, null, 2));
  const handleSetPrimary = async (leagueId: string, userId: string) => {
    const { data, error } = await setPrimaryLeague(leagueId);
    if (error) {
      console.error("Error setting primary league:", error);
      console.log("error", JSON.stringify(error, null, 2));
    } else {
      setLeagues(data as any);
      console.log("data", JSON.stringify(data, null, 2));
    }
  };

  useEffect(() => {
    getLeagues();
  }, []);

  const Header = () => {
    return (
      <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
        <Button
          title="Create League"
          variant="primary"
          size="small"
          onPress={() => router.push("/(app)/(newLeague)/create-league")}
        />
        <Button
          title="Join League"
          variant="secondary"
          size="small"
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
          data={leagues || []}
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
