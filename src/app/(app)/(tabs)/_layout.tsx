import LeagueIcon from "../../../../assets/icons/league.svg";
import MatchIcon from "../../../../assets/icons/matches.svg";
import RankIcon from "../../../../assets/icons/stats.svg";
import TrophyIcon from "../../../../assets/icons/trophy.svg";

import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "gray",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Leagues",
          tabBarLabel: ({ focused, color }) => (
            <Text
              className={`${focused ? "black" : ""} text-sm font-bold`}
              style={{ fontSize: 12 }}
            >
              My Leagues
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <TrophyIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="League"
        options={{
          title: "League",
          tabBarLabel: ({ focused, color }) => (
            <Text
              className={`${focused ? "black" : "gray-500"} text-sm font-bold`}
              style={{ fontSize: 12 }}
            >
              League
            </Text>
          ),

          tabBarIcon: ({ color, size }) => (
            <LeagueIcon width={size} height={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          title: "Matches",
          tabBarLabel: ({ focused, color }) => (
            <Text
              className={`${focused ? "black" : ""} `}
              style={{ fontSize: 12 }}
            >
              Matches
            </Text>
          ),

          tabBarIcon: ({ color, size }) => (
            <MatchIcon width={size} height={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Rank"
        options={{
          title: "Rank",
          tabBarLabel: ({ focused, color }) => (
            <Text
              className={`${focused ? "black" : "gray-500"} text-sm font-bold`}
              style={{ fontSize: 12 }}
            >
              Rank
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <RankIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
