import { CText } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { StarIcon } from '@assets/icons';
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

  if (isPrimary) {
    return (
      <View className="flex-row items-center gap-1">
        <StarIcon size={18} />
        <CText variant="caption" bold className="text-primary">
          {t('Primary')}
        </CText>
      </View>
    );
  }

  return null;
}

export default function MyLeagueCard({ item, onPress }: LeagueCardProps) {
  const isLocked = !item.active;

  return (
    <View className={`rounded-xl bg-surface p-3${isLocked ? ' opacity-50' : ''}`}>
      <TouchableOpacity onPress={onPress} activeOpacity={isLocked ? 1 : 0.7} disabled={isLocked}>
        <View className="items-center gap-2">
          <View className="flex-row items-start gap-2">
            <LogoBadge source={{ uri: item.league.competition?.logo }} width={70} height={70} />
            <LeagueStatusBadge isPrimary={item.is_primary} isLocked={isLocked} />
          </View>

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
