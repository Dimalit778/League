import { LogoBadge } from '@/components/LogoBadge';
import { StarIcon } from '@assets/icons';
import { Text, TouchableOpacity, View } from 'react-native';
interface LeagueCardProps {
  item: any;
  handleSetPrimary: (leagueId: string, isPrimary: boolean) => void;
}
export default function LeagueCard({ item, handleSetPrimary }: LeagueCardProps) {
  return (
    <View className="bg-surface rounded-xl">
      <TouchableOpacity onPress={() => handleSetPrimary(item.league.id, item.is_primary)} activeOpacity={0.8}>
        <View className="flex-row items-center">
          <LogoBadge source={{ uri: item.league.competition.logo }} width={70} height={70} />
          <View className="flex-1 ps-4 ">
            <Text className="text-2xl font-headBold text-text" numberOfLines={1}>
              {item.league.name}
            </Text>
            <Text className="text-base text-muted">{item.nickname}</Text>
          </View>

          <View className="justify-end items-end p-3">{item.is_primary && <StarIcon size={36} />}</View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
