import { AvatarImage } from '@/components/ui';

import { CText } from '@/components/ui';
import { useIsRTL } from '@/providers/LanguageProvider';
import { Tables } from '@/types/database.types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Link } from 'expo-router';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LeaderboardType = Tables<'league_leaderboard_view'>;
type TopThreeProps = {
  topMembers: LeaderboardType[];
};
export default function TopThree({ topMembers }: TopThreeProps) {
  const insets = useSafeAreaInsets();
  const isRTL = useIsRTL();

  const renderPlayer = (member: LeaderboardType | undefined, position: number) => {
    const { size, className } = getPositionSize(position);
    const crownSize = 30;
    const crownOffset = crownSize / 2;

    const crownStyle = isRTL
      ? {
          right: '20%',
          transform: [{ translateX: crownOffset }],
        }
      : {
          left: '50%',
          transform: [{ translateX: -crownOffset }],
        };

    return (
      <Link href={`/(app)/(member)/member/id?memberId=${member?.member_id}`} asChild>
        <TouchableOpacity className="items-center" key={position} disabled={!member} activeOpacity={member ? 0.7 : 1}>
          <View className="relative">
            {position === 1 && member && (
              <View className="absolute -top-7" style={crownStyle as StyleProp<ViewStyle>}>
                <FontAwesome6 name="crown" size={crownSize} color="gold" />
              </View>
            )}
            <View
              className={`absolute -top-2 -left-3 w-8 h-8 bg-secondary rounded-full justify-center items-center ${className}`}
            >
              <CText className="text-base font-bold text-background">{position}</CText>
            </View>
            <View
              className={`rounded-full overflow-hidden ${className} ${!member ? 'opacity-30' : ''}`}
              style={{ width: size, height: size }}
            >
              <AvatarImage nickname={member?.nickname!} path={member?.avatar_url} />
            </View>
          </View>
          <CText className="mt-2 text-text font-bold">{member?.nickname}</CText>
        </TouchableOpacity>
      </Link>
    );
  };

  if (!topMembers || topMembers.length === 0) return null;

  return (
    <View style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-center gap-5 mb-3  ">
        <View className="items-center">{renderPlayer(topMembers[1], 2)}</View>
        <View className="items-center -mt-8">{renderPlayer(topMembers[0], 1)}</View>
        <View className="items-center">{renderPlayer(topMembers[2], 3)}</View>
      </View>
    </View>
  );
}
function getPositionSize(position: number): { size: number; className: string } {
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
}
