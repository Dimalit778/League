import { Text, View } from 'react-native';

export default function MatchStats({
  stats,
}: {
  stats: { label: string; home: number; away: number; isPercentage: boolean }[];
}) {
  return (
    <View className="flex-1 bg-background items-center ">
      <View className=" mt-14 items-center justify-center">
        <Text className="text-text text-center text-3xl font-nunito-black">Coming Soon...</Text>
      </View>
    </View>
  );
}
