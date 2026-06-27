import {} from '@/assets/icons';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType, Text, View } from 'react-native';

type MatchCardProps = {
  homeTeam: string;
  awayTeam: string;
  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;

  homeScore?: number | null;
  awayScore?: number | null;

  predictionHome?: number | null;
  predictionAway?: number | null;

  date: string;
  time: string;
};

export function MatchCard({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  predictionHome,
  predictionAway,
  date,
  time,
}: MatchCardProps) {
  const scoreText =
    homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined
      ? `${homeScore} - ${awayScore}`
      : 'VS';

  const predictionText =
    predictionHome !== null && predictionHome !== undefined && predictionAway !== null && predictionAway !== undefined
      ? `${predictionHome} - ${predictionAway}`
      : 'לא נשלח';

  return (
    <View className="mx-4 my-3">
      <View className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-5 pb-5 pt-14 shadow-lg shadow-slate-400/30">
        {/* Top date tab */}
        <View className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-3xl border-b border-l border-r border-slate-200 bg-slate-50 px-6 py-3 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={20} color="#334155" />
            <Text className="text-[15px] font-semibold text-slate-700">
              {date} | {time}
            </Text>
          </View>
        </View>

        {/* Main content */}
        <View className="flex-row items-center justify-between">
          {/* Home team */}
          <View className="w-[30%] items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-md shadow-slate-300/40">
              <Image source={homeLogo} className="h-16 w-16" resizeMode="contain" />
            </View>

            <Text numberOfLines={1} className="mt-3 text-center text-lg font-bold text-slate-900">
              {homeTeam}
            </Text>
          </View>

          {/* Score */}
          <View className="w-[35%] items-center">
            <Text className="text-center text-5xl font-black tracking-tight text-slate-950">{scoreText}</Text>
          </View>

          {/* Away team */}
          <View className="w-[30%] items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 shadow-md shadow-slate-300/40">
              <Image source={awayLogo} className="h-16 w-16" resizeMode="contain" />
            </View>

            <Text numberOfLines={1} className="mt-3 text-center text-lg font-bold text-slate-900">
              {awayTeam}
            </Text>
          </View>
        </View>

        {/* Prediction bottom tab */}
        <View className="mx-auto mt-6 w-[58%] rounded-t-[26px] border border-emerald-100 bg-emerald-50 px-5 py-3 shadow-sm">
          <Text className="text-center text-sm font-semibold text-emerald-700">הניחוש שלי</Text>

          <Text className="mt-1 text-center text-3xl font-black text-emerald-700">{predictionText}</Text>
        </View>
      </View>
    </View>
  );
}
