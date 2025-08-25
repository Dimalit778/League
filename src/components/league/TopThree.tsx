import { Text, View } from 'react-native';

export default function TopThree({ topMembers }: { topMembers: any }) {
  const getInitials = (nickname: string) => {
    return nickname
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'w-24 h-24 bg-yellow-500 border-4 border-yellow-400';
      case 2:
        return 'w-20 h-20 bg-teal-500 border-4 border-teal-400';
      case 3:
        return 'w-20 h-20 bg-blue-500 border-4 border-blue-400';
      default:
        return 'w-20 h-20 bg-gray-500 border-4 border-gray-400';
    }
  };

  const renderPlayer = (
    member: {
      nickname: string;
      avatar_url: string;
      total_points: number;
      index: number;
    } | null,
    position: number
  ) => (
    <View className="items-center" key={position}>
      <View className="relative ">
        {position === 1 && member && (
          <View className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <Text className="text-yellow-500 text-2xl">👑</Text>
          </View>
        )}
        <View className="absolute -top-2 -left-2 w-6 h-6 bg-secondary rounded-full border-2 border-border items-center justify-center">
          <Text className="text-text text-xs font-bold">{position}</Text>
        </View>
        <View
          className={`rounded-full items-center justify-center ${getPositionStyle(position)} ${!member ? 'opacity-30' : ''}`}
        >
          {member ? (
            <Text className="text-text font-bold text-lg">
              {member.avatar_url || getInitials(member.nickname)}
            </Text>
          ) : (
            <Text className="text-text text-lg">👤</Text>
          )}
        </View>
      </View>
      <Text className="text-text font-medium mt-2 text-center max-w-24">
        {member ? member.nickname : '---'}
      </Text>
    </View>
  );

  if (!topMembers || topMembers.length === 0) return null;

  return (
    <View className="flex-row justify-center gap-5 mt-4 mb-6">
      <View className="items-center">{renderPlayer(topMembers[1], 2)}</View>
      <View className="items-center -mt-8">
        {renderPlayer(topMembers[0], 1)}
      </View>
      <View className="items-center">{renderPlayer(topMembers[2], 3)}</View>
    </View>
  );
}
