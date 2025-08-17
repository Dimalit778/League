import TopBar from "@/components/layout/TopBar";
import {
  LeagueIcon,
  MatchesIcon,
  ProfileIcon,
  RankIcon,
} from "../../../../assets/icons";

import { useTheme } from "@/context/ThemeContext";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.theme === "dark" ? "#f9c04a" : "#f97316",
        tabBarInactiveTintColor: theme.theme === "dark" ? "#94a3b8" : "#6b7280",

        tabBarStyle: Platform.select({
          ios: {
            // position: "absolute",
            backgroundColor: theme.theme === "dark" ? "#1e293b" : "#f3f4f6",
            borderTopWidth: 0,
          },
          android: {
            backgroundColor: theme.theme === "dark" ? "#1e293b" : "#f3f4f6",
            borderTopWidth: 0,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="League"
        options={{
          title: "League",
          header: () => <TopBar title="League" />,
          tabBarIcon: ({ color, size }) => (
            <LeagueIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          title: "Matches",
          header: () => <TopBar title="Matches" />,
          tabBarIcon: ({ color, size }) => (
            <MatchesIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Rank"
        options={{
          title: "Rank",
          header: () => <TopBar title="Rank" />,
          tabBarIcon: ({ color, size }) => (
            <RankIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          header: () => <TopBar title="Profile" />,
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
