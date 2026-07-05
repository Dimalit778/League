import { CText } from '@/components/ui/CText';
import { Image } from 'expo-image';
import { ChevronLeft, Trophy, View } from 'lucide-react-native';
import { Pressable } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  trophyUrl?: string | null;
};

export function LeagueOverviewHeader({ title, subtitle, trophyUrl }: Props) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
      <Pressable>
        <ChevronLeft size={28} color="#D99A00" />
      </Pressable>

      <View className="flex-1 ml-4">
        <CText className="text-white text-2xl font-bold">{title}</CText>
        <CText className="text-muted text-base">{subtitle}</CText>
      </View>

      {trophyUrl ? <Image source={{ uri: trophyUrl }} className="w-12 h-12" /> : <Trophy size={34} color="#D99A00" />}
    </View>
  );
}
