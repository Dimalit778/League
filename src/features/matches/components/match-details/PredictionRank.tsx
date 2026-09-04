import { AvatarImage, Card, Row, Text } from '@/components';
import { MemberPrediction } from '@/features/matches/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Crosshair } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { ActivityIndicator, FlatList, View, type ViewStyle } from 'react-native';

type RankCardProps = {
  item: MemberPrediction;
  index: number;
  currentMember: boolean;
  isFinished: boolean;
};

const POINTS_BG: Record<number, string> = { 5: 'gold', 3: 'green', 0: 'red' };

function Chip({ className, style, children }: { className?: string; style?: ViewStyle; children: ReactNode }) {
  return (
    <View className={cn('items-center justify-center rounded-md', className)} style={style}>
      {children}
    </View>
  );
}

const RankCard = ({ item, index, currentMember, isFinished }: RankCardProps) => {
  const member = item.league_member;

  return (
    <Card
      padding="sm"
      variant="flat"
      className={currentMember ? 'border border-primary' : undefined}
      contentClassName="flex-row items-center px-3"
    >
      <Row className="min-w-0 flex-1 flex-row items-center gap-5">
        <Chip className="h-7 w-7 border border-border bg-border">
          <Text variant="body" className="font-bold text-info">
            {index}
          </Text>
        </Chip>

        <Row className="items-center gap-2">
          <View className="h-12 w-12">
            <AvatarImage path={member?.avatar_url} nickname={member?.nickname} />
          </View>
          <Text
            variant="body"
            className={cn('min-w-0 flex-1', currentMember ? 'text-primary' : 'text-text')}
            numberOfLines={1}
          >
            {member?.nickname}
          </Text>
        </Row>
      </Row>

      <Row className="gap-6">
        <Chip className="h-8 w-14 bg-subtle">
          <Text className="font-bold text-text">
            {item.home_score ?? '-'} - {item.away_score ?? '-'}
          </Text>
        </Chip>
        {isFinished ? (
          <Chip className="h-8 w-10" style={{ backgroundColor: POINTS_BG[item.points ?? 0] ?? 'red' }}>
            <Text className="font-bold" style={{ color: POINTS_BG[item.points ?? 0] === 'gold' ? 'black' : 'white' }}>
              {item.points ?? 0}
            </Text>
          </Chip>
        ) : null}
      </Row>
    </Card>
  );
};

function NoPredictions() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  return (
    <View className="mt-16 flex-1 items-center justify-center">
      <Crosshair size={40} color={colors.muted} />
      <Text variant="title" weight="bold" className="text-center text-muted">
        {t('No predictions')}
      </Text>
    </View>
  );
}
export default function PredictionRank({
  predictions,
  isLoading = false,
  isFinished = false,
}: {
  predictions: MemberPrediction[];
  isLoading?: boolean;
  isFinished?: boolean;
}) {
  const memberId = useMemberId();
  const { colors } = useThemeTokens();

  return (
    <View className={cn('flex-1 ', spacing.screen)}>
      {isLoading ? (
        <View className="mt-16 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="py-4 gap-2"
          renderItem={({ item, index }) => (
            <RankCard
              item={item}
              index={index + 1}
              currentMember={memberId === item.league_member?.id}
              isFinished={isFinished}
            />
          )}
          ListEmptyComponent={<NoPredictions />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
