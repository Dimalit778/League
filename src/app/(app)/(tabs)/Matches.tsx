import FixtureList from "@/components/FixtureList";
import MatchesList from "@/components/MatchesList";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { useEffect, useState } from "react";
import { View } from "react-native";

const fixtures = [
  { fixtureNumber: "F21", date: "14/02" },
  { fixtureNumber: "F22", date: "14/02" },
  { fixtureNumber: "F23", date: "14/02" },
  { fixtureNumber: "F24", date: "15/02" },
  { fixtureNumber: "F25", date: "15/02" },
  { fixtureNumber: "F26", date: "15/02" },
  // Add more fixtures as needed
];

const matchesData = {
  F21: [
    { homeTeam: "Team A", awayTeam: "Team B", score: "-:-" },
    { homeTeam: "Team C", awayTeam: "Team D", score: "-:-" },
  ],
  F22: [
    { homeTeam: "Team E", awayTeam: "Team F", score: "-:-" },
    { homeTeam: "Team G", awayTeam: "Team H", score: "-:-" },
  ],
  F23: [{ homeTeam: "Team I", awayTeam: "Team J", score: "-:-" }],
  F24: [
    { homeTeam: "RCD Espanyol de Barcelona", awayTeam: "Celta", score: "-:-" },
    { homeTeam: "RCD Mallorca", awayTeam: "Real Betis", score: "-:-" },
    { homeTeam: "Girona FC", awayTeam: "FC Barcelona", score: "-:-" },
    {
      homeTeam: "Rayo Vallecano",
      awayTeam: "Atlético de Madrid",
      score: "-:-",
    },
    { homeTeam: "Real Oviedo", awayTeam: "Athletic Club", score: "-:-" },
    { homeTeam: "Sevilla FC", awayTeam: "Deportivo Alavés", score: "-:-" },
    { homeTeam: "Real Madrid", awayTeam: "Real Sociedad", score: "-:-" },
    { homeTeam: "Levante UD", awayTeam: "Valencia CF", score: "-:-" },
    { homeTeam: "Getafe CF", awayTeam: "Villarreal CF", score: "-:-" },
    { homeTeam: "Elche CF", awayTeam: "C.A. Osasuna", score: "-:-" },
  ],
  // Add more fixture matches as needed
};

export default function MatchesPage() {
  const [allMatches, setAllMatches] = useState<Tables<"matches">[]>([]);

  const getMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `
      )
      .eq("competition_id", "2014")
      .eq("matchday", 6)
      .order("utc_date", { ascending: true });
    if (error) {
      console.log("error", JSON.stringify(error, null, 2));
      console.error(error);
    } else {
      console.log("data", JSON.stringify(data, null, 2));
      setAllMatches(data);
    }
  };

  useEffect(() => {
    getMatches();
  }, []);

  return (
    <View className="flex-1 bg-black p-4">
      <FixtureList
        fixtures={fixtures}
        selectedFixture={""}
        handleFixturePress={() => {}}
      />
      {/* Matches Table */}
      <MatchesList allMatches={allMatches} />
    </View>
  );
}
