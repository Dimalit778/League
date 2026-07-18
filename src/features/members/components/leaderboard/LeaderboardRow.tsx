import { AvatarImage } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Trophy } from 'lucide-react-native';
import { View } from 'react-native';
import { LeaderboardMember } from '../../types';

type LeaderboardRowProps = {
  member: LeaderboardMember;
  position: number;
};

export function LeaderboardRow({ member, position }: LeaderboardRowProps) {
  const { colors } = useThemeTokens();

  return (
    <View className="min-h-20 flex-row items-center py-3">
      <View className="w-10 items-center">
        <Text bold className="text-muted">
          {position}
        </Text>
      </View>

      <View className="mr-3 h-12 w-12">
        <AvatarImage path={member.avatar_url} nickname={member.nickname} />
      </View>

      <View className="min-w-0 flex-1">
        <Text semibold numberOfLines={1}>
          {member.nickname}
        </Text>
      </View>

      <View className="items-end">
        <View className="flex-row items-center gap-1">
          <Trophy size={16} color={colors.primary} />

          <Text bold>{member.total_points}</Text>
        </View>

        <Text caption className="mt-1 text-success">
          points
        </Text>
      </View>
    </View>
  );
}
