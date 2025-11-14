import { AvatarImage, Card } from '@/components/ui';
import { MemberPredictionType } from '@/types';
import { Text, View } from 'react-native';

interface PredictionCardProps {
  item: MemberPredictionType;
  index: number;
  currentUserId: string;
}
const getPointsColor = (points: number | null | undefined) => {
  switch (points) {
    case 5:
      return 'green';
    case 3:
      return 'gray';
    default:
      return 'red';
  }
};
const PointsBadge = ({ points }: { points: number | null | undefined }) => {
  const color = getPointsColor(points);

  return (
    <View
      className="rounded-full w-8 h-8 items-center justify-center border border-border"
      style={{ borderColor: color }}
    >
      <Text className="font-bold text-sm" style={{ color }}>
        {points ?? 0}
      </Text>
    </View>
  );
};
export default function PredictionCard({ item, index, currentUserId }: PredictionCardProps) {
  const isCurrentUser = currentUserId === item.user_id;

  return (
    <Card className={`${isCurrentUser ? 'border-primary' : ''} p-2 my-1 `}>
      <View className="flex-row items-center justify-between gap-2">
        {/* Position */}
        <View className="w-6 h-6 rounded-lg  flex items-center justify-center border border-border">
          <Text className="text-sm text-secondary">{index}</Text>
        </View>

        {/* User Avatar */}

        <AvatarImage path={item.member.avatar_url} nickname={item.member.nickname} />
        {/* Nickname */}
        <Text className="text-sm text-text font-bold">{item.member.nickname}</Text>

        {/* Score */}
        <View className="flex-1 flex-row items-center justify-end gap-5">
          <View className="flex-row gap-2 border border-border rounded-lg px-2 py-1 items-center justify-center">
            <Text className="text-sm text-text ">
              {item.home_score} - {item.away_score}
            </Text>
          </View>
          {/* Points */}
          <PointsBadge points={item.points} />
        </View>
      </View>
    </Card>
  );
}
