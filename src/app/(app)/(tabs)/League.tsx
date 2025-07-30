import LeagueCard from "@/components/LeagueCard";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/services/store/AppStore";
import useAuthStore from "@/services/store/AuthStore";
import { TLeague } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserLeague extends TLeague {
  member_count?: number;
  user_nickname?: string;
  is_primary?: boolean;
}

export default function League() {
  const { user } = useAuthStore();
  const { setPrimaryLeague: setAppPrimaryLeague } = useAppStore();
  const { setSelectedLeague } = useAppStore();
  const [userLeagues, setUserLeagues] = useState<UserLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserLeagues = async (showLoading = true) => {
    if (!user?.id) return;

    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      // Get user profile to check primary league
      const { data: profileData } = await supabase
        .from("profiles")
        .select("primary_league_id")
        .eq("id", user.id)
        .single();

      const primaryLeagueId = profileData?.primary_league_id;

      // Get leagues where user is a member
      const { data: memberLeagues, error: memberError } = await supabase
        .from("league_members")
        .select(
          `
          nickname,
          league:leagues (
            id,
            name,
            selected_league,
            admin_id,
            invite_code,
            max_members,
            created_at
          )
        `
        )
        .eq("user_id", user.id);

      if (memberError) {
        console.error("Error fetching member leagues:", memberError);
        return;
      }

      // Get member counts for each league
      const leagueIds = memberLeagues?.map((ml: any) => ml.league.id) || [];
      const memberCounts: { [key: string]: number } = {};

      if (leagueIds.length > 0) {
        const { data: counts, error: countError } = await supabase
          .from("league_members")
          .select("league_id")
          .in("league_id", leagueIds);

        if (!countError && counts) {
          counts.forEach((count: any) => {
            memberCounts[count.league_id] =
              (memberCounts[count.league_id] || 0) + 1;
          });
        }
      }

      // Format the data
      const leagues: UserLeague[] =
        memberLeagues?.map((ml: any) => ({
          ...ml.league,
          member_count: memberCounts[ml.league.id] || 0,
          user_nickname: ml.nickname,
          is_primary: ml.league.id === primaryLeagueId,
        })) || [];

      setUserLeagues(leagues);
    } catch (error) {
      console.error("Error fetching user leagues:", error);
      Alert.alert("Error", "Failed to load your leagues");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserLeagues();
  }, [user?.id]);

  const handleRefresh = () => {
    fetchUserLeagues(false);
  };

  const handleLeaguePress = (league: UserLeague) => {
    // Navigate to league details
    Alert.alert("League Selected", `You selected ${league.name}`);
  };

  const handleSetPrimary = async (league: UserLeague) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Use the AppStore function to set primary league
      await setAppPrimaryLeague(user.id, league.id);

      // Update the UI
      const updatedLeagues = userLeagues.map((l) => ({
        ...l,
        is_primary: l.id === league.id,
      }));

      setUserLeagues(updatedLeagues);
      Alert.alert("Success", `${league.name} set as your primary league`);
    } catch (error) {
      console.error("Error setting primary league:", error);
      Alert.alert("Error", "Failed to set primary league");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-lg text-gray-600 text-center">
          Please sign in to view your leagues
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            My Leagues
          </Text>
          <Text className="text-gray-600">
            Manage your football prediction leagues
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(app)/(newLeague)/create-league")}
              className="flex-1 bg-blue-600 rounded-lg py-3 px-4"
            >
              <Text className="text-white font-semibold text-center">
                Create League
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(app)/(newLeague)/join-league")}
              className="flex-1 bg-green-600 rounded-lg py-3 px-4"
            >
              <Text className="text-white font-semibold text-center">
                Join League
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leagues List */}
        <View className="px-4">
          {loading && userLeagues.length === 0 ? (
            <View className="py-8">
              <Text className="text-center text-gray-500">
                Loading leagues...
              </Text>
            </View>
          ) : userLeagues.length > 0 ? (
            <>
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Your Leagues ({userLeagues.length})
              </Text>
              {userLeagues.map((league) => (
                <View key={league.id} className="mb-3">
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <LeagueCard
                        leagueId={league.selected_league}
                        leagueName={league.name}
                        memberCount={league.member_count}
                        maxMembers={league.max_members}
                        onPress={() => handleLeaguePress(league)}
                      />
                    </View>
                    <TouchableOpacity
                      className={`ml-2 p-2 rounded-full ${league.is_primary ? "bg-blue-100" : "bg-gray-100"}`}
                      onPress={() => handleSetPrimary(league)}
                      disabled={league.is_primary}
                    >
                      <Ionicons
                        name={league.is_primary ? "star" : "star-outline"}
                        size={24}
                        color={league.is_primary ? "#3b82f6" : "#6b7280"}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center justify-between mt-1 ml-2">
                    {league.user_nickname && (
                      <Text className="text-xs text-gray-500">
                        Your nickname: {league.user_nickname}
                      </Text>
                    )}
                    {league.is_primary && (
                      <Text className="text-xs text-blue-600 font-medium">
                        Primary League
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View className="py-8">
              <Text className="text-center text-gray-600 text-lg mb-4">
                You haven't joined any leagues yet
              </Text>
              <Text className="text-center text-gray-500 mb-6">
                Create your own league or join an existing one using an invite
                code
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() =>
                    router.push("/(app)/(newLeague)/create-league")
                  }
                  className="flex-1 bg-blue-600 rounded-lg py-3 px-4"
                >
                  <Text className="text-white font-semibold text-center">
                    Create Your First League
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/(app)/(newLeague)/join-league")}
                  className="flex-1 border border-blue-600 rounded-lg py-3 px-4"
                >
                  <Text className="text-blue-600 font-semibold text-center">
                    Join League
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* League Stats */}
        {userLeagues.length > 0 && (
          <View className="px-4 mt-6 mb-8">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Quick Stats
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {userLeagues.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Leagues</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {userLeagues.reduce(
                      (sum, league) => sum + (league.member_count || 0),
                      0
                    )}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Members</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-purple-600">
                    {
                      userLeagues.filter(
                        (league) => league.admin_id === user.id
                      ).length
                    }
                  </Text>
                  <Text className="text-sm text-gray-600">You Admin</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
