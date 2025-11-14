import { AvatarImage } from '@/components/ui';
import { useStoreData } from '@/store/store';
import { LeaderboardView } from '@/types';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface TopThreeProps {
  topMembers: LeaderboardView[];
}

export default function TopThree({ topMembers }: TopThreeProps) {
  const { league } = useStoreData();
  const router = useRouter();

  const getPositionSize = (position: number) => {
    switch (position) {
      case 1:
        return {
          size: 96,
          className: 'bg-yellow-500 border-4 border-yellow-400',
        };
      case 2:
        return {
          size: 80,
          className: 'bg-teal-500 border-4 border-teal-400 ',
        };
      default:
        return {
          size: 70,
          className: 'bg-blue-500 border-4 border-blue-400 mt-2',
        };
    }
  };

  const handlePress = (member: LeaderboardView | undefined) => {
    if (!member?.user_id || !league?.id) return;

    router.push({
      pathname: '/(app)/(member)/member/details',
      params: {
        userId: member.user_id,
        leagueId: league.id,
        nickname: member.nickname || '',
        avatarUrl: member.avatar_url || '',
      },
    });
  };

  const renderPlayer = (member: LeaderboardView | undefined, position: number) => {
    const { size, className } = getPositionSize(position);
    return (
      <TouchableOpacity
        className="items-center"
        key={position}
        onPress={() => handlePress(member)}
        disabled={!member}
        activeOpacity={member ? 0.7 : 1}
      >
        <View className="relative">
          {position === 1 && member && (
            <View className="absolute -top-7 left-1/2 transform -translate-x-1/2">
              <FontAwesome6 name="crown" size={30} color="gold" />
            </View>
          )}
          <View
            className={`absolute -top-2 -left-3 w-8 h-8 bg-secondary rounded-full justify-center items-center ${className}`}
          >
            <Text className="text-base font-bold text-background">{position}</Text>
          </View>
          <View
            className={`rounded-full overflow-hidden ${className} ${!member ? 'opacity-30' : ''}`}
            style={{ width: size, height: size }}
          >
            <AvatarImage nickname={member?.nickname!} path={member?.avatar_url} />
          </View>
        </View>
        <Text className="mt-2 text-text font-bold">{member?.nickname}</Text>
      </TouchableOpacity>
    );
  };

  if (!topMembers || topMembers.length === 0) return null;

  return (
    <View className="flex-row justify-center gap-5 my-4">
      <View className="items-center">{renderPlayer(topMembers[1], 2)}</View>
      <View className="items-center -mt-8">{renderPlayer(topMembers[0], 1)}</View>
      <View className="items-center">{renderPlayer(topMembers[2], 3)}</View>
    </View>
  );
}
