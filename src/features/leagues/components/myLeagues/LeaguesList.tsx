import { Card, Text } from '@/components/ui';
import { LockedBadge } from '@/components/ui/LockedBadge';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { FlatList, View } from 'react-native';
import { MyLeagueType } from '../../types';

interface LeaguesListProps {
  leagues: MyLeagueType[];
  onPress: (leagueId: string, isPrimary: boolean) => void;
}

export default function LeaguesList({ leagues, onPress }: LeaguesListProps) {
  const { t } = useTranslation();

  return (
    <View className="mt-4">
      <Text semibold className="px-4 mb-2">
        {t('My Leagues')}
      </Text>

      <FlatList
        data={leagues}
        keyExtractor={(item) => item.league.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
        renderItem={({ item }) => {
          const isLocked = !item.active;
          return (
            <View className="w-44">
              <Card
                padding="md"
                contentClassName="h-[72px] justify-center"
                onPress={() => onPress(item.league.id, item.is_primary)}
              >
                {isLocked && <LockedBadge />}
                <View
                  className="relative flex-1 justify-center"
                  style={{
                    opacity: isLocked ? 0.2 : 1,
                  }}
                >
                  <View className="flex-row items-center">
                    <LogoBadge source={{ uri: item.league.competition?.logo }} width={52} height={52} />

                    <View className="mx-1 h-16 w-px bg-border" />

                    <View className="min-w-0 flex-1 px-2">
                      <Text bold numberOfLines={1}>
                        {item.league.name}
                      </Text>

                      <Text caption numberOfLines={1} className="mt-1 text-muted">
                        {item.nickname}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          );
        }}
      />
    </View>
  );
}
