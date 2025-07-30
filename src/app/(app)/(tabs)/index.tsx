import { Button } from "@/components/Button";
import ImageC from "@/components/ui/ImageC";
import { supabase } from "@/lib/supabase";
import useAuthStore from "@/services/store/AuthStore";
import { TCompetition, TLeague } from "@/types/database.types";
import { router, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface LeagueCardProps {
  league: TLeague;
  isSelected: boolean;
  onSelect: () => void;
  isPrimary: boolean;
}

const LeagueCard = ({
  item,
  isPrimary = false,
}: {
  item: TLeague & { competition: TCompetition };
  isPrimary?: boolean;
}) => {
  return (
    <TouchableOpacity
      className="p-4 rounded-lg bg-white mb-3 shadow-sm border border-gray-100"
      onPress={() => {}}
    >
      {/* Header with logo and name */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center space-x-3">
          <ImageC
            source={{ uri: item.competition.logo }}
            className="w-10 h-10 rounded-full"
            width={40}
            height={40}
            resizeMode="contain"
          />
          <View>
            <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
            <Text className="text-sm text-gray-500">
              {item.competition.name}
            </Text>
          </View>
        </View>

        {/* Primary badge - only show if isPrimary is true */}
        {isPrimary && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-green-700">Primary</Text>
          </View>
        )}
      </View>

      {/* League info */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-500">Join Code</Text>
          <Text className="text-sm font-mono font-medium">
            {item.join_code}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-gray-500">Created</Text>
          <Text className="text-sm">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View className="bg-blue-500 px-3 py-1 rounded-full">
          <Text className="text-white text-sm font-medium">Join</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
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

export default function MyLeagues() {
  const [leagues, setLeagues] = useState<
    (TLeague & { competition: TCompetition })[]
  >([]);
  const getLeagues = async () => {
    const { data, error } = await supabase
      .from("leagues")
      .select(
        `
        *,
        competition:competitions(*)
      `
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      console.log("data", data);
      setLeagues(data as (TLeague & { competition: TCompetition })[]);
    }
  };

  useEffect(() => {
    getLeagues();
  }, []);

  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <View className="px-4 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          My Leagues
        </Text>
        <Text className="text-gray-600">
          Manage your football prediction leagues
        </Text>
      </View>
      <View className="flex-1 px-4">
        <FlatList
          data={leagues}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-gray-500 text-lg mb-4">
                No leagues found
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                Create your first league or join an existing one to get started
              </Text>
              <Button
                title="Create League"
                variant="primary"
                onPress={() => router.push("/(app)/(newLeague)/create-league")}
              />
            </View>
          )}
          renderItem={({ item, index }) => (
            <LeagueCard
              item={item}
              isPrimary={index === 0} // Just for demo, first league is primary
            />
          )}
        />
      </View>
    </View>
  );
}
