import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { FlatList, Text, View } from 'react-native';
import { PredictionsMemberType } from '../../types';

interface FinishedMatchProps {
  predictions: PredictionsMemberType[] | undefined;
  avatarMap: Map<string, string | null>;
}

export default function FinishedMatch({ predictions = [], avatarMap }: FinishedMatchProps) {
  const member = useMemberStore((state) => state.member);

  return (
    <View className="flex-1 bg-background px-4">
      <View className="items-center justify-center mb-4">
        <Text className="text-text  text-2xl font-nunito-black">Members Predictions</Text>
        <Text className="text-muted  text-sm font-nunito mb-4">See how your members predicted this match</Text>
      </View>

      <View className="flex-row px-1 mb-2 ">
        <Text className="flex-1 text-[10px] text-secondary">Player</Text>
        <Text className="w-16 text-[10px] text-secondary text-center">Prediction</Text>
        <Text className="w-10 text-[10px] text-secondary text-center">Points</Text>
      </View>
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          return (
            <PredictionsLeaderCard
              item={item}
              index={index + 1}
              currentUserId={member?.user_id || ''}
              avatarMap={avatarMap}
            />
          );
        }}
      />
    </View>
  );
}

function PredictionsLeaderCard({
  item,
  index,
  currentUserId,
  avatarMap,
}: {
  item: PredictionsMemberType;
  index: number;
  currentUserId: string;
  avatarMap: Map<string, string | null>;
}) {
  const isCurrentUser = currentUserId === item.league_member.user_id;
  const borderColor = item.points === 3 ? 'green' : item.points === 1 ? 'gray' : 'red';
  const avatarPath = item.league_member.avatar_url;
  const avatarUrl = avatarPath ? (avatarMap.get(avatarPath) ?? avatarPath) : null;
  return (
    <View
      className={`
        flex-row items-center justify-between rounded-2xl px-3 py-2 mb-2
        bg-card border
        ${isCurrentUser ? 'border-primary' : 'border-border'}
      `}
    >
      {/* Left side: position + avatar + nickname */}
      <View className="flex-row items-center gap-3 flex-1">
        {/* Position pill */}
        <View className="w-7 h-7 rounded-full border border-border items-center justify-center">
          <Text className="text-xs text-secondary">{index}</Text>
        </View>

        {/* Avatar */}
        {avatarUrl ? (
          <ExpoImage
            source={{ uri: avatarUrl }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <FontAwesome name="user-circle-o" size={28} color="grey" />
        )}

        {/* Nickname */}
        <Text className={`text-sm font-semibold ${isCurrentUser ? 'text-primary' : 'text-text'}`} numberOfLines={1}>
          {item.league_member.nickname}
        </Text>
      </View>

      {/* Middle: prediction */}
      <View className="px-2 py-1 rounded-xl border border-border mx-2">
        <Text className="text-xs text-text">
          {item.home_score ?? '-'} - {item.away_score ?? '-'}
        </Text>
      </View>

      {/* Right: points bubble */}
      <View
        className="w-9 h-9 rounded-full items-center justify-center border"
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
}
