import { Button } from '@/components/ui/Button';
import { CText } from '@/components/ui/CText';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { MyLeagueType } from '@/features/leagues/types';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';

type LimitModalProps = {
  visible: boolean;
  leagues: MyLeagueType[];
  userId: string;
  onUpgrade: () => Promise<void>;
  isLoading: boolean;
};

export const LimitModal = ({
  visible,
  leagues,
  userId,
  onUpgrade,
  isLoading,
}: LimitModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [savingLeagueId, setSavingLeagueId] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleChooseLeague = async (leagueId: string) => {
    setSavingLeagueId(leagueId);
    try {
      const { error } = await (supabase as any).rpc('choose_active_league', {
        p_league_id: leagueId,
      });
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({
        queryKey: KEYS.users.leagues(userId),
      });
    } catch {
      Alert.alert(t('Error'), t('Failed to update leagues. Please try again.'));
    } finally {
      setSavingLeagueId(null);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

  const isBusy = isLoading || savingLeagueId !== null || isUpgrading;

  return (
    <Modal
      visible={visible}
      backdropColor="rgba(0, 0, 0, 0.0)"
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-surface rounded-2xl p-6 w-full max-w-sm max-h-[85%]">
          <CText variant="h3" bold className="mb-2">
            Your paid plan has ended
          </CText>
          <CText variant="caption" className="text-muted mb-4">
            Free users can keep 1 active league. Choose which league stays
            active, or upgrade to unlock all your leagues.
          </CText>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={leagues}
              keyExtractor={(item) => item.league_id}
              showsVerticalScrollIndicator={false}
              className="max-h-64 mb-4"
              renderItem={({ item }) => {
                const isSaving = savingLeagueId === item.league_id;
                return (
                  <TouchableOpacity
                    className="border border-border rounded-xl p-3 mb-2 flex-row items-center"
                    onPress={() => handleChooseLeague(item.league_id)}
                    disabled={isBusy}
                    activeOpacity={0.7}
                  >
                    <LogoBadge
                      source={{ uri: item.league.competition?.logo }}
                      width={48}
                      height={48}
                    />
                    <View className="flex-1 mx-3">
                      <CText bold numberOfLines={1}>
                        {item.league.name}
                      </CText>
                      <CText
                        variant="caption"
                        className="text-muted mt-0.5"
                        numberOfLines={1}
                      >
                        {item.league.competition?.name}
                      </CText>
                    </View>
                    {isSaving ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <CText variant="caption" bold className="text-secondary">
                        Keep active
                      </CText>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <CText
                  variant="caption"
                  className="text-muted text-center py-4"
                >
                  No owned leagues found.
                </CText>
              }
            />
          )}

          <Button
            title={t('Upgrade')}
            variant="primary"
            size="md"
            onPress={handleUpgrade}
            loading={isUpgrading}
            disabled={isBusy && !isUpgrading}
          />
        </View>
      </View>
    </Modal>
  );
};
