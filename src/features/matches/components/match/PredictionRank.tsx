import { AvatarImage } from '@/components/ui';
import { useMemberStore } from '@/store/MemberStore';
import { FlatList, Text, View } from 'react-native';
import { PredictionMemberType } from '../../types';

type RankCardProps = {
  item: PredictionMemberType;
  index: number;
  currentMember: boolean;
};
const RankCard = ({ item, index, currentMember }: RankCardProps) => {
  const borderColor = item.points === 3 ? 'green' : item.points === 1 ? 'gray' : 'red';

  return (
    <View
      className={`
            flex-row items-center justify-between rounded-2xl px-3 py-2 mb-2
            bg-card border
            ${currentMember ? 'border-primary' : 'border-border'}
          `}
    >
      {/* Left side: position + avatar + nickname */}
      <View className="flex-row items-center gap-3 flex-1">
        {/* Position pill */}
        <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
          <Text className="text-xs text-secondary">{index}</Text>
        </View>

        {/* Avatar */}
        <View className="w-10 h-10">
          <AvatarImage path={item.league_member?.avatar_url} nickname={item.league_member?.nickname} />
        </View>

        {/* Nickname */}
        <Text className={`text-sm font-semibold ${currentMember ? 'text-primary' : 'text-text'}`} numberOfLines={1}>
          {item.league_member?.nickname}
        </Text>
      </View>

      {/* Middle: prediction */}
      <View className="px-2 py-1 rounded-xl border border-border mx-4 ">
        <Text className="text-xs text-text">
          {item.home_score ?? '-'} - {item.away_score ?? '-'}
        </Text>
      </View>

      {/* Right: points bubble */}
      <View
        className="w-7 h-7 rounded-full items-center justify-center border"
        style={{
          borderColor: borderColor,
        }}
      >
        <Text
          className="text-xs font-bold"
          style={{
            color: borderColor,
          }}
        >
          {item.points ?? 0}
        </Text>
      </View>
    </View>
  );
};

export default function PredictionRank({ predictions }: { predictions: PredictionMemberType[] }) {
  const memberId = useMemberStore((state) => state.memberId) ?? '';

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row px-1 gap-3 py-2  ">
        <Text className="flex-1 text-sm text-text">Player</Text>
        <Text className="text-sm text-text text-center">Prediction</Text>
        <Text className="text-sm text-text text-center">Points</Text>
      </View>
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          return (
            <RankCard key={item.id} item={item} index={index + 1} currentMember={memberId === item.league_member.id} />
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-16">
            <Text className="text-center font-nunito-bold text-2xl font-bold text-muted">No predictions</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
