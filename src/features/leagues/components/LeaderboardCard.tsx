import { AvatarImage, CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { selectLeagueId, useMemberStore } from '@/store/MemberStore';
import { Link } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { LeaderboardRow } from '../types';

interface LeaderboardCardProps {
  item: LeaderboardRow;
  index: number;
  isCurrentUser: boolean;
}

export default function LeaderboardCard({ item, index, isCurrentUser }: LeaderboardCardProps) {
  const { nickname, avatar_url, total_points, correct_scores, member_id } = item;
  const { t } = useTranslation();
  const leagueId = useMemberStore(selectLeagueId);
  const rank = index + 1;

  const textColor = isCurrentUser ? 'text-[#E3B421]' : 'text-white';
  const mutedColor = isCurrentUser ? 'text-[#E3B421]/80' : 'text-[#97A7BF]';

  return (
    <Link
      href={{
        pathname: '/(app)/league/[leagueId]/member/[memberId]',
        params: { leagueId: leagueId ?? '', memberId: member_id ?? '' },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7}>
        <View
          className={`mx-3 mb-1.5 flex-row items-center rounded-xl px-2 py-2.5 ${
            isCurrentUser ? 'border border-[#E3B421] bg-[#101A2A]' : 'bg-[#0D1524]'
          }`}
        >
          <CText className={`w-6 text-sm font-bold ${textColor}`}>{rank}</CText>

          <View className="flex-1 flex-row items-center gap-2 pr-1">
            <View className="h-7 w-7 overflow-hidden rounded-full">
              <AvatarImage nickname={nickname!} path={avatar_url} />
            </View>
            <CText className={`flex-1 text-sm font-semibold ${textColor}`} numberOfLines={1}>
              {nickname}
            </CText>
          </View>

          <CText className={`w-14 text-center text-xs font-semibold ${textColor}`}>
            {total_points?.toLocaleString() ?? 0} {t('pts')}
          </CText>

          <CText className={`w-10 text-center text-xs font-semibold ${mutedColor}`}>
            {correct_scores ?? 0}
          </CText>

          <View className="w-10 items-center">
            <CText className={`text-xs ${mutedColor}`}>—</CText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
