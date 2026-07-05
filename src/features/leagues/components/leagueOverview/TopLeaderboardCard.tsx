import { AvatarImage } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { LeaderboardRow } from '@/features/leagues/types';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
type Props = {
  user: LeaderboardRow;
  isCurrentUser: boolean;
};
function Row({ user, isCurrentUser }: Props) {
  return (
    <View
      className={`
          flex-row items-center py-3 px-3 rounded-xl
          ${isCurrentUser ? 'border border-primaryGold bg-goldGlow' : ''}
        `}
    >
      <CText className="text-white w-8">{user.rank}</CText>

      <AvatarImage path={user.avatar_url} fallback={user.nickname?.[0]} />

      <CText
        className={`
            flex-1 ml-3 font-semibold
            ${isCurrentUser ? 'text-primaryGold' : 'text-white'}
          `}
      >
        {user.nickname}
      </CText>

      <CText
        className={`
            font-bold
            ${isCurrentUser ? 'text-primaryGold' : 'text-white'}
          `}
      >
        {user.points} pts
      </CText>
    </View>
  );
}
export function TopLeaderboardCard({ users, currentMemberId }: { users: LeaderboardRow[]; currentMemberId: string }) {
  return (
    <View className="rounded-3xl border border-cardBorder bg-card p-4">
      <View className="flex-row justify-between items-center mb-4">
        <CText className="text-white text-lg font-bold">Top leaderboard</CText>

        <Link href="/table" asChild>
          <Pressable className="flex-row items-center">
            <CText className="text-primaryGold">View full table</CText>
            <ChevronRight size={18} color="#D99A00" />
          </Pressable>
        </Link>
      </View>

      {users.map((user) => (
        <Row key={user.memberId} user={user} isCurrentUser={user.memberId === currentMemberId} />
      ))}
    </View>
  );
}
