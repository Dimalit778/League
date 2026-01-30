import { CText } from '@/components/ui';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

interface LeaderboardCardProps {
  item: any;
  index: number;
  isCurrentUser: boolean;
}

export default function LeaderboardCard({ item, index, isCurrentUser }: LeaderboardCardProps) {
  const { nickname, avatar_url, total_points } = item;
  const memberId = item.member_id;
  const { t } = useTranslation();
  return (
    <Link
      href={{
        pathname: '/(app)/(member)/member/id',
        params: {
          memberId: memberId,
        },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7}>
        <Card className={`${isCurrentUser ? 'border-primary' : ''} px-3 py-1 my-1.5`}>
          <View className="flex-row items-center gap-3">
            {/* Position Badge */}
            <View className="w-8 h-8 rounded-full items-center justify-center bg-background">
              <CText variant="caption" bold className="text-text">
                {index + 1}
              </CText>
            </View>
            <View className="w-10 h-10 rounded-full overflow-hidden">
              <AvatarImage nickname={nickname!} path={avatar_url} />
            </View>
            {/* User Info */}
            <View className="flex-1 items-start">
              <CText variant="body" bold className="text-text" numberOfLines={1}>
                {nickname}
              </CText>
            </View>

            {/* Points Section */}
            <View className="items-center pr-2">
              <CText variant="body" bold>
                {total_points?.toLocaleString() ?? 0}
              </CText>
              <CText variant="caption" className="text-muted">
                {t('pts')}
              </CText>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Link>
  );
}
