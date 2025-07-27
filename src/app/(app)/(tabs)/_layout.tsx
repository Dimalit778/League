import LeagueIcon from "../../../../assets/icons/LeagueIcon";
import MatchesIcon from "../../../../assets/icons/MatchesIcon";
import ProfileIcon from "../../../../assets/icons/ProfileIcon";
import RankIcon from "../../../../assets/icons/RankIcon";
import TrophyIcon from "../../../../assets/icons/TrophyIcon";

import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        tabBarActiveTintColor: "#f9c04a",
        tabBarInactiveTintColor: "gray",

        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "#1A1A1A",
            borderTopWidth: 0,
          },
          android: {
            backgroundColor: "#1A1A1A",
            borderTopWidth: 0,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Leagues",
          tabBarIcon: ({ color, size }) => (
            <TrophyIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="League"
        options={{
          title: "League",

          tabBarIcon: ({ color, size }) => (
            <LeagueIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          title: "Matches",

          tabBarIcon: ({ color, size }) => (
            <MatchesIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Rank"
        options={{
          title: "Rank",

          tabBarIcon: ({ color, size }) => (
            <RankIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
