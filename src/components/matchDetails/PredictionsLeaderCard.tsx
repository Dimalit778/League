import { PredictionLeaderboardType } from '@/types';
import { FontAwesome } from '@expo/vector-icons';
import { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { Card } from '../ui';

// Custom comparison function for better memoization
const areEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.points === nextProps.item.points &&
    prevProps.item.home_score === nextProps.item.home_score &&
    prevProps.item.away_score === nextProps.item.away_score &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.index === nextProps.index
  );
};

export const PredictionsLeaderCard = memo(
  ({
    item,
    index,
    currentUserId,
  }: {
    item: PredictionLeaderboardType;
    index: number;
    currentUserId: string;
  }) => {
    const isCurrentUser = currentUserId === item.user_id;

    return (
      <Card className={`${isCurrentUser ? 'border-primary' : ''} p-2 my-1 `}>
        <View className="flex-row items-center justify-between gap-2">
          {/* Position */}
          <View className="w-6 h-6 rounded-lg  flex items-center justify-center border border-border">
            <Text className="text-sm text-secondary">{index}</Text>
          </View>

          {/* User Avatar */}

          {item.member.avatar_url ? (
            <View className="w-8 h-8 rounded-full overflow-hidden border-2 border-border">
              <Image
                source={{
                  uri: item.member.avatar_url,
                }}
                className="w-full h-full"
                width={30}
                height={30}
              />
            </View>
          ) : (
            <FontAwesome name="user-circle-o" size={30} color="grey" />
          )}
          {/* Nickname */}
          <Text className="text-sm text-text font-bold">
            {item.member.nickname}
          </Text>

          {/* Score */}
          <View className="flex-1 flex-row items-center justify-end gap-5">
            <View className="flex-row gap-2 border border-border rounded-lg px-2 py-1 items-center justify-center">
              <Text className="text-sm text-text ">
                {item.home_score} - {item.away_score}
              </Text>
            </View>
            {/* Points */}
            <View
              className="rounded-full w-8 h-8 flex items-center justify-center border border-border"
              style={{
                borderColor:
                  item.points === 3
                    ? 'green'
                    : item.points === 1
                      ? 'gray'
                      : 'red',
              }}
            >
              <Text
                className="text-text font-bold text-sm"
                style={{
                  color:
                    item.points === 3
                      ? 'green'
                      : item.points === 1
                        ? 'gray'
                        : 'red',
                }}
              >
                {item.points ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  },
  areEqual // Use custom comparison function
);
