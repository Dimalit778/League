import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function FixtureList({
  fixtures,
  selectedFixture,
  handleFixturePress,
}: {
  fixtures: any[];
  selectedFixture: string;
  handleFixturePress: (fixtureNumber: string) => void;
}) {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {fixtures.map((fixture) => (
          <TouchableOpacity
            key={fixture.id}
            onPress={() => handleFixturePress(fixture.id)}
            className={`mx-2 px-4 py-2 rounded-full ${
              selectedFixture === fixture.id ? "bg-green-500" : "bg-gray-800"
            }`}
            style={{
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white font-semibold">{fixture.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
