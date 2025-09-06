import { MemberQueryType } from '@/services/leagueService';
import { Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TrashIcon } from '../../../assets/icons';
import StarIcon from '../../../assets/icons/StarIcon';
import { Image } from '../ui';
interface LeagueCardProps {
  item: MemberQueryType[number];
  onSetPrimary: () => void;
  onLeaveLeague: () => void;
  swipeableRef: (ref: any) => void;
}

const LeagueCard = ({
  item,
  onSetPrimary,
  onLeaveLeague,
  swipeableRef,
}: LeagueCardProps) => {
  const renderRightActions = () => (
    <View className="h-full justify-center items-center w-20 bg-red-500">
      <TouchableOpacity
        className="justify-center items-center p-3 w-full h-full"
        onPress={onLeaveLeague}
        activeOpacity={0.7}
      >
        <TrashIcon size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="my-2 px-3">
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        rightThreshold={60}
        renderRightActions={renderRightActions}
        containerStyle={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <View className="bg-surface p-4">
          <TouchableOpacity onPress={onSetPrimary} activeOpacity={0.8}>
            <View className="flex-row items-center">
              <Image
                source={{ uri: item.leagues.logo }}
                width={48}
                height={48}
                resizeMode="contain"
                className="rounded-lg mr-3"
              />

              <View className="flex-1 ps-2">
                <Text
                  className="text-2xl font-headBold text-text"
                  numberOfLines={1}
                >
                  {item.leagues.name}
                </Text>
                <Text className="text-base text-muted">
                  {item.leagues.league_members[0].count || 0}/
                  {item.leagues.max_members} members
                </Text>
              </View>

              <View className="justify-end items-end">
                {item.is_primary && <StarIcon size={36} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ReanimatedSwipeable>
    </View>
  );
};

export default LeagueCard;
