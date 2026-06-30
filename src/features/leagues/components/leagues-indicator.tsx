import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type LeaguesIndicatorProps = {
  used: number;
  limit: number;
  onPress?: () => void;
};

export function LeaguesIndicator({ used, limit, onPress }: LeaguesIndicatorProps) {
  const progress = Math.min(used / limit, 1);

  return (
    <Pressable
      onPress={onPress}
      className="mx-5 rounded-2xl border border-white/10 bg-[#101A2A] px-4 py-4 active:opacity-80"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-[#3A321C]">
          <ShieldCheck size={26} color="#E0A800" strokeWidth={1.8} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-white/90">Active leagues</Text>

          <Text className="mt-1 text-lg font-bold text-[#F2B705]">
            {used}/{limit}
          </Text>

          {/* Progress bar */}
          <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <View className="h-full rounded-full bg-[#E0A800]" style={{ width: `${progress * 100}%` }} />
          </View>

          <Text className="mt-3 text-sm text-white/65">
            <Text className="font-semibold text-[#F2B705]">Upgrade</Text> to join more leagues
          </Text>
        </View>

        {/* Arrow */}
        <ChevronRight size={22} color="rgba(255,255,255,0.75)" />
      </View>
    </Pressable>
  );
}
