import { MemberLeague } from '@/types';
import { Text, TouchableOpacity, View } from 'react-native';
import StarIcon from '../../../assets/icons/StarIcon';
import { Image } from '../ui';

const LeagueCard = ({
  item,
  onSetPrimary,
}: {
  item: MemberLeague;
  onSetPrimary: () => void;
}) => {
  return (
    <View className="my-2 px-3">
      <View className="bg-surface p-4">
        <TouchableOpacity onPress={onSetPrimary} activeOpacity={0.8}>
          <View className="flex-row items-center">
            <Image
              source={{ uri: item.league.logo }}
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
                {item.league.name}
              </Text>
              <Text className="text-base text-muted">{item.nickname}</Text>
            </View>

            <View className="justify-end items-end">
              {item.is_primary && <StarIcon size={36} />}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeagueCard;
