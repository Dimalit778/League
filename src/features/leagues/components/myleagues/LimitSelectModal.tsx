import { Button, CText } from '@/components/ui';
import { MyLeagueType } from '@/features/leagues/types';
import { useTranslation } from '@/hooks/useTranslation';
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
      <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
        <View className="rounded-2xl border border-border bg-background p-4" style={{ maxHeight: '82%' }}>
          <CText variant="h2" className="text-text">
            {t('Choose active leagues')}
          </CText>
          <CText variant="body" className="mt-2 text-muted">
            {t('Your free plan allows {{count}} active leagues. Choose which leagues stay active to continue.', {
              count: String(maxLeagues),
            })}
          </CText>
          <View className="mt-3 flex-row items-center justify-between">
            <CText variant="bodyBold" className={selectedCount > maxLeagues ? 'text-error' : 'text-text'}>
              {selectedCount}/{maxLeagues}
            </CText>
            <Pressable onPress={onUpgrade} className="rounded-lg border border-yellow-500 px-3 py-2">
              <CText variant="caption" bold className="text-yellow-500">
                {t('Upgrade to Pro')}
              </CText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 py-4">
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
                  style={{ width: 220 }}
                >
                  <View className="min-h-[112px] justify-between">
                    <View className="flex-row items-start justify-between">
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full border ${
                          selected ? 'border-primary bg-primary' : 'border-muted'
                        }`}
                      >
                        {selected && <View className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </View>
                      {league.is_primary && (
                        <CText variant="caption" bold className="text-primary">
                          {t('Primary')}
                        </CText>
                      )}
                    </View>

                    <View>
                      <CText variant="bodyBold" numberOfLines={1} className="text-text">
                        {league.league.name}
                      </CText>
                      <CText variant="caption" numberOfLines={1} className="text-muted">
                        {league.league.competition?.name ?? t('Unknown League')}
                      </CText>
                    </View>
                  </View>
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
