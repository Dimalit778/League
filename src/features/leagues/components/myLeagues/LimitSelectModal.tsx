import { Button, LogoBadge, Text } from '@/components';
import { MyLeague } from '@/features/leagues/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';

type LimitSelectModalProps = {
  leagues: MyLeague[];
  maxLeagues: number;
  selectedMemberIds: string[];
  isSaving: boolean;
  canSave: boolean;
  onToggleLeague: (memberId: string) => void;
  onSave: () => void;
  onUpgrade: () => void;
};

const LeagueCard = ({ league, selected }: { league: MyLeague; selected: boolean }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3">
      <LogoBadge source={{ uri: league.league.competition?.logo }} width={48} height={48} />

      <View className="min-w-0 flex-1">
        {league.is_primary && (
          <Text className="text-sm font-bold mb-0.5 text-primary">
            {t('Primary')}
          </Text>
        )}
        <Text numberOfLines={1} className="font-semibold text-text">
          {league.league.name}
        </Text>
        <Text numberOfLines={1} className="text-xs mt-0.5 text-muted">
          {league.nickname}
        </Text>
      </View>

      <View
        className={`h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary bg-primary' : 'border-muted'
        }`}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-background" />}
      </View>
    </View>
  );
};
type ModalHeaderProps = {
  maxLeagues: number;
  selectedCount: number;
  onUpgrade: () => void;
};
const ModalHeader = ({ maxLeagues, selectedCount, onUpgrade }: ModalHeaderProps) => {
  const { t } = useTranslation();
  const theme = useThemeTokens();
  return (
    <>
      <View className="items-center ">
        <Text className="text-2xl font-bold text-text">
          {t('Choose {{count}} active leagues', { count: maxLeagues })}
        </Text>
        <Text className="text-base mt-2 text-muted text-center">
          {t('Your subscription has ended. Choose the leagues you want to keep active.')}
        </Text>
        <Text className="text-sm mt-2 text-muted text-center">
          {t('Your other leagues and data will remain saved.')}
        </Text>
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="bg-subtle rounded-lg px-3 py-2">
          <Text className={`font-semibold ${selectedCount > maxLeagues ? 'text-error' : 'text-text'}`}>
            {selectedCount}/{maxLeagues}
          </Text>
        </View>
        <Pressable
          onPress={onUpgrade}
          className="flex-row items-center gap-2 rounded-lg border border-primary px-3 py-2"
        >
          <Text className="font-bold text-primary">
            {t('Upgrade')}
          </Text>
          <ChevronRight size={18} color={theme.colors.primary} />
        </Pressable>
      </View>
    </>
  );
};
export default function LimitSelectModal({
  leagues,
  maxLeagues,
  selectedMemberIds,
  isSaving,
  canSave,
  onToggleLeague,
  onSave,
  onUpgrade,
}: LimitSelectModalProps) {
  const { t } = useTranslation();
  const selectedCount = selectedMemberIds.length;
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.90)' }}>
        <View className="rounded-2xl border border-border bg-background p-4" style={{ maxHeight: '82%' }}>
          <ModalHeader maxLeagues={maxLeagues} selectedCount={selectedCount} onUpgrade={onUpgrade} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3 py-4">
            {leagues.map((league) => {
              const selected = selectedMemberIds.includes(league.id);
              const cannotSelect = !selected && selectedCount >= maxLeagues;

              return (
                <Pressable
                  key={league.id}
                  onPress={() => onToggleLeague(league.id)}
                  disabled={cannotSelect}
                  className={`rounded-xl border bg-surface p-4 ${selected ? 'border-primary' : 'border-border'} ${
                    cannotSelect || !league.active ? 'opacity-50' : ''
                  }`}
                >
                  <LeagueCard league={league} selected={selected} />
                </Pressable>
              );
            })}
          </ScrollView>

          <Button label={t('Save active leagues')} size="lg" onPress={onSave} loading={isSaving} disabled={!canSave} />
        </View>
      </View>
    </Modal>
  );
}
