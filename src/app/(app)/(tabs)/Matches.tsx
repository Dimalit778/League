import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  const [selectedFixture, setSelectedFixture] = useState("F24");

  const handleFixturePress = (fixtureNumber: string) => {
    setSelectedFixture(fixtureNumber);
  };

  const matches =
    matchesData[selectedFixture as keyof typeof matchesData] || [];

  return (
    <View className="flex-1 bg-black p-4">
      {/* Fixture Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {fixtures.map((fixture) => (
          <TouchableOpacity
            key={fixture.fixtureNumber}
            onPress={() => handleFixturePress(fixture.fixtureNumber)}
            className={`mx-2 px-4 py-2 rounded-full ${
              selectedFixture === fixture.fixtureNumber
                ? "bg-green-500"
                : "bg-gray-800"
            }`}
            style={{
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white font-semibold">
              {fixture.fixtureNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Matches Table */}
      <View className="mt-4">
        {matches.length === 0 ? (
          <Text className="text-white text-center mt-4">
            No matches for this fixture
          </Text>
        ) : (
          matches.map(
            (
              match: { homeTeam: string; score: string; awayTeam: string },
              index: number
            ) => (
              <View
                key={index}
                className="flex-row justify-center items-center bg-gray-800 rounded px-4 py-3 mb-2 mx-2"
              >
                <Text className="flex-1 text-white text-center">
                  {match.homeTeam}
                </Text>
                <Text className="text-white mx-2">{match.score}</Text>
                <Text className="flex-1 text-white text-center">
                  {match.awayTeam}
                </Text>
              </View>
            )
          )
        )}
      </View>
    </View>
  );
}
