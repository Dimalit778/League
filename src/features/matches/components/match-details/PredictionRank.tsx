import { AvatarImage, Text } from '@/components/ui';
import { PredictionWithMemberType } from '@/features/matches/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { FlatList, View } from 'react-native';

type RankCardProps = {
  item: PredictionWithMemberType;
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
          <Text className="text-xs text-info">{index}</Text>
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

export default function PredictionRank({ predictions }: { predictions: PredictionWithMemberType[] }) {
  const memberId = useMemberId();
  const { t } = useTranslation();

  return (
    <View className="flex-1 p-4 md:px-10 ">
      <View className="flex-row px-1 gap-3 py-2  ">
        <Text className="font-semibold text-sm flex-1 text-text text-left">
          {t('Player')}
        </Text>
        <Text className="font-semibold text-sm text-text text-center">
          {t('Prediction')}
        </Text>
        <Text className="font-semibold text-sm text-text text-center">
          {t('Points')}
        </Text>
      </View>
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          return (
            <RankCard key={item.id} item={item} index={index + 1} currentMember={memberId === item.league_member?.id} />
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-16">
            <Text className="font-semibold text-sm text-center text-muted">
              {t('No predictions')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
