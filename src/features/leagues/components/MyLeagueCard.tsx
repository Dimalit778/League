import { CText } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { LockedLeagueBadge } from '@/features/leagues/components/LockedLeagueBadge';
import { StarIcon } from '@assets/icons';
import { TouchableOpacity, View } from 'react-native';
import { MyLeagueType } from '../types';
interface LeagueCardProps {
  item: MyLeagueType;
  handleSetPrimary: (leagueId: string, isPrimary: boolean) => void;
}
export default function MyLeagueCard({ item, handleSetPrimary }: LeagueCardProps) {
  const isLocked = !item.active;
  return (
    <View className={`bg-surface rounded-xl${isLocked ? ' opacity-50' : ''}`}>
      <TouchableOpacity
        onPress={() => !isLocked && handleSetPrimary(item.league.id, item.is_primary)}
        activeOpacity={isLocked ? 1 : 0.8}
        disabled={isLocked}
      >
        <View className="flex-row items-center">
          <LogoBadge source={{ uri: item.league.competition?.logo }} width={70} height={70} />
          <View className="flex-1 ps-4 ">
            <CText className="text-2xl font-headBold text-text" numberOfLines={1}>
              {item.league.name}
            </CText>
            <CText className="text-base text-muted">{item.nickname}</CText>
            <LockedLeagueBadge isLocked={isLocked} />
          </View>

          <View className="justify-end items-end p-3">{item.is_primary && <StarIcon size={36} />}</View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
