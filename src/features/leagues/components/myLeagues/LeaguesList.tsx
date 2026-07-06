import { CText } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { MyLeagueType } from '../../types';

interface LeaguesListProps {
  leagues: MyLeagueType[];
  inactiveLeagues: MyLeagueType[];
  onPress: (leagueId: string, isPrimary: boolean) => void;
}

export default function LeaguesList({ leagues, inactiveLeagues, onPress }: LeaguesListProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-2 mt-4 flex-1"
    >
      <FlatList
        data={leagues}
        keyExtractor={(item) => item.league.id}
        renderItem={({ item }) => {
          const isLocked = !item.active;
          return (
            <View key={item.league.id} className="w-[180px]">
              <View className={`rounded-xl bg-surface p-3 items-center gap-2 ${!item.active ? ' opacity-50' : ''}`}>
                <TouchableOpacity
                  onPress={() => onPress(item.league.id, item.is_primary)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between w-full"
                >
                  <View className=" items-start gap-2">
                    <LogoBadge source={{ uri: item.league.competition?.logo }} width={70} height={70} />
                    {isLocked && (
                      <View className="rounded-md bg-background px-2 py-1">
                        <CText className="text-text">{t('Not Active')}</CText>
                      </View>
                    )}
                  </View>
                  <View className="flex-1 items-start gap-2">
                    <CText className="text-center font-headBold text-lg text-text" numberOfLines={1}>
                      {item.league.name}
                    </CText>
                    <CText className="text-center text-sm text-muted" numberOfLines={1}>
                      {item.nickname}
                    </CText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </ScrollView>
  );
}
