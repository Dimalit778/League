import { Button, LogoBadge, Text } from '@/components';
import { MyLeague } from '@/features/leagues/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight, Crown, LockIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { Modal, Pressable, FlatList, View } from 'react-native';

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

const LeagueCard = ({ league, selected, proLocked }: { league: MyLeague; selected: boolean; proLocked: boolean }) => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  return (
    <View className="flex-row  gap-3">
      <View className="overflow-hidden rounded-md">
        <LogoBadge source={{ uri: league.league.competition?.flag ?? '' }} width={48} height={48} />
      </View>

      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-semibold ">
          {league.league.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1} className=" text-muted">
          {league.nickname}
        </Text>
        {proLocked && (
          <View className="flex-row items-center gap-1 mt-2">
            <Crown size={12} color={colors.muted} />
            <Text variant="caption" tone="muted" className=" font-semibold  ">
              {t('Pro League')}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center ">
        {proLocked ? (
          <LockIcon size={24} color={colors.muted} />
        ) : (
          <View
            className={`h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              selected ? 'border-primary bg-primary' : 'border-muted'
            }`}
          >
            {selected && <View className="h-2.5 w-2.5 rounded-full bg-background" />}
          </View>
        )}
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
        <Text className="text-2xl font-bold text-text">{t('Activate Leagues', { count: maxLeagues })}</Text>
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
          accessibilityRole="button"
          accessibilityLabel={t('Upgrade')}
          className="min-h-12 flex-row items-center gap-2 rounded-lg border border-primary px-3 py-2"
        >
          <Text className="font-bold text-primary">{t('Upgrade')}</Text>
          <ChevronRight size={18} color={theme.colors.primary} />
        </Pressable>
      </View>
    </>
  );
};
type LimitLeagueRowProps = {
  league: MyLeague;
  selected: boolean;
  selectedCount: number;
  maxLeagues: number;
  onToggleLeague: (memberId: string) => void;
};

function LimitLeagueRow({ league, selected, selectedCount, maxLeagues, onToggleLeague }: LimitLeagueRowProps) {
  const proLocked = league.league.competition?.is_free === false;
  const cannotSelect = proLocked || (!selected && selectedCount >= maxLeagues);

  return (
    <Pressable
      onPress={() => onToggleLeague(league.id)}
      disabled={cannotSelect}
      accessibilityRole="checkbox"
      accessibilityLabel={`${league.league.name}, ${league.nickname}`}
      accessibilityState={{ checked: selected, disabled: cannotSelect }}
      className={`rounded-xl border bg-surface p-4 ${selected ? 'border-primary' : 'border-border'} ${
        cannotSelect || !league.active ? 'opacity-50' : ''
      }`}
    >
      <LeagueCard league={league} selected={selected} proLocked={proLocked} />
    </Pressable>
  );
}

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
  const renderLeague = useCallback(
    ({ item: league }: { item: MyLeague }) => (
      <LimitLeagueRow
        league={league}
        selected={selectedMemberIds.includes(league.id)}
        selectedCount={selectedCount}
        maxLeagues={maxLeagues}
        onToggleLeague={onToggleLeague}
      />
    ),
    [maxLeagues, onToggleLeague, selectedCount, selectedMemberIds],
  );
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.90)' }}>
        <View className="rounded-2xl border border-border bg-background p-4" style={{ maxHeight: '82%' }}>
          <ModalHeader maxLeagues={maxLeagues} selectedCount={selectedCount} onUpgrade={onUpgrade} />
          <FlatList
            data={leagues}
            keyExtractor={(league) => league.id}
            extraData={selectedMemberIds}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 py-4"
            renderItem={renderLeague}
          />

          <Button label={t('Save active leagues')} size="lg" onPress={onSave} loading={isSaving} disabled={!canSave} />
        </View>
      </View>
    </Modal>
  );
}
