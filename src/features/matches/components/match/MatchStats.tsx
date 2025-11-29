import { ScrollView, Text, View } from 'react-native';

const StatRow = ({
  label,
  home,
  away,
  isPercentage,
}: {
  label: string;
  home: number;
  away: number;
  isPercentage: boolean;
}) => {
  // Calculate width percentages for the bar
  const total = home + away;
  // Handle edge case where total is 0 to avoid NaN
  const safeTotal = total === 0 ? 1 : total;

  const homePercent = (home / safeTotal) * 100;
  const awayPercent = (away / safeTotal) * 100;

  return (
    <View className="mb-6">
      {/* Text Values */}
      <View className="flex-row justify-between items-center mb-2 px-1">
        <Text className="text-white font-bold text-base">
          {home}
          {isPercentage ? '%' : ''}
        </Text>
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</Text>
        <Text className="text-white font-bold text-base">
          {away}
          {isPercentage ? '%' : ''}
        </Text>
      </View>

      {/* Progress Bar Container */}
      <View className="h-1.5 flex-row bg-slate-800 rounded-full overflow-hidden w-full">
        {/* Home Bar (Gradient illusion using solid color for demo) */}
        <View className="bg-blue-300" style={{ width: `${homePercent}%`, opacity: home === 0 ? 0 : 1 }} />
        {/* Spacer/Gap in middle if needed, or just adjacent colors */}
        <View className="w-1 bg-slate-900" />
        {/* Away Bar */}
        <View className="bg-blue-600" style={{ width: `${awayPercent}%`, opacity: away === 0 ? 0 : 1 }} />
      </View>
    </View>
  );
};

export default function MatchStats({
  stats,
}: {
  stats: { label: string; home: number; away: number; isPercentage: boolean }[];
}) {
  return (
    <View className="flex-1 bg-background pt-4">
      {/* Large Background Text */}
      <View className="absolute top-0 w-full flex-row justify-between opacity-10 mt-2">
        <Text className="text-8xl font-black text-slate-500 -ml-4 italic">BAR</Text>
        <Text className="text-8xl font-black text-slate-500 -mr-4 italic">ALA</Text>
      </View>

      <View className="px-6 mt-4">
        <Text className="text-gray-300 text-lg font-bold mb-6">Team Stats</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {stats.map((stat, index) => (
            <StatRow
              key={index}
              label={stat.label}
              home={stat.home}
              away={stat.away}
              isPercentage={stat.isPercentage}
            />
          ))}
          {/* Extra space for scrolling */}
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
}
