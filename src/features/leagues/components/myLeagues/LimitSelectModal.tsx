import { Button, Text } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { MyLeagueType } from '@/features/leagues/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';

type LimitSelectModalProps = {
  leagues: MyLeagueType[];
  maxLeagues: number;
  selectedMemberIds: string[];
  isSaving: boolean;
  canSave: boolean;
  onToggleLeague: (memberId: string) => void;
  onSave: () => void;
  onUpgrade: () => void;
};

const LeagueCard = ({ league, selected }: { league: MyLeagueType; selected: boolean }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3">
      <LogoBadge source={{ uri: league.league.competition?.logo }} width={48} height={48} />

      <View className="min-w-0 flex-1">
        {league.is_primary && (
          <Text caption bold className="mb-0.5 text-primary">
            {t('Primary')}
          </Text>
        )}
        <Text semibold className="text-text" numberOfLines={1}>
          {league.league.name}
        </Text>
        <Text small className="mt-0.5 text-muted" numberOfLines={1}>
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
        <Text h2 bold className="text-text">
          {t('Choose {{count}} active leagues', { count: maxLeagues })}
        </Text>
        <Text body className="mt-2 text-muted text-center">
          Your subscription has ended. Choose the leagues you want to keep active.
        </Text>
        <Text caption className="mt-2 text-muted text-center">
          Your other leagues and data will remain saved.
        </Text>
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="bg-surfaceSecondary rounded-lg px-3 py-2">
          <Text semibold className={selectedCount > maxLeagues ? 'text-error' : 'text-text'}>
            {selectedCount}/{maxLeagues}
          </Text>
        </View>
        <Pressable
          onPress={onUpgrade}
          className="flex-row items-center gap-2 rounded-lg border border-primary px-3 py-2"
        >
          <Text bold className="text-primary">
            {t('Keep all leagues active')}
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

          <Button title={t('Save active leagues')} size="lg" onPress={onSave} loading={isSaving} disabled={!canSave} />
        </View>
      </View>
    </Modal>
  );
}
