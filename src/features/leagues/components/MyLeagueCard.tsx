import { CText } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { TouchableOpacity, View } from 'react-native';
import { MyLeagueType } from '../types';

interface LeagueCardProps {
  item: MyLeagueType;
  onPress: () => void;
}

function LeagueStatusBadge({ isPrimary, isLocked }: { isPrimary: boolean; isLocked: boolean }) {
  const { t } = useTranslation();

  if (isLocked) {
    return (
      <View className="rounded-md bg-background px-2 py-1">
        <CText variant="caption" bold className="text-text">
          {t('Not Active')}
        </CText>
      </View>
    );
  }

  return null;
}

export default function MyLeagueCard({ item, onPress }: LeagueCardProps) {
  const isLocked = !item.active;

  return (
    <View className={`rounded-xl bg-surface p-3 items-center gap-2 ${isLocked ? ' opacity-50' : ''}`}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center justify-between w-full">
        <View className=" items-start gap-2">
          <LogoBadge source={{ uri: item.league.competition?.logo }} width={70} height={70} />
          <LeagueStatusBadge isPrimary={item.is_primary} isLocked={isLocked} />
        </View>
        <View className="flex-1 items-start gap-2">
          <CText className="text-center font-headBold text-lg text-text" numberOfLines={1}>
            {item.league.name}
          </CText>
          <CText className="text-center text-sm text-muted" numberOfLines={1}>
            {item.nickname}
          </CText>
        </View>
      </TouchableOpacity>
    </View>
  );
}
