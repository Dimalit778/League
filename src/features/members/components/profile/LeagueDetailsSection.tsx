import { MyImage } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';

import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { LeagueWithMembersType } from '@/types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, TouchableOpacity, View } from 'react-native';

export const LeagueDetailsSection = ({
  league,
  memberUserId,
}: {
  league: LeagueWithMembersType;
  memberUserId: string;
}) => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert(t('Copied!'), t('Join code copied to clipboard.'));
    }
  };
  const owner = useMemo(() => {
    return league.league_members.find((member: { user_id: string }) => member.user_id === league.owner_id);
  }, [league.league_members, league.owner_id]);

  return (
    <View className="px-4 mt-4">
      <View className="bg-surface rounded-2xl border border-border p-4">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surfaceSecondary">
            <Shield size={18} color={colors.primary} />
          </View>
          <Text className="flex-1 text-base font-bold text-text">{t('League details')}</Text>

          {league.owner_id === memberUserId && (
            <Link href="/(app)/(league)/edit" asChild>
              <TouchableOpacity className="p-2" hitSlop={6}>
                <FontAwesome6 name="pen-to-square" size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          )}
        </View>

        <View className="h-[1px] bg-border my-3" />

        <View className="gap-3">
          {/* League Name */}
          <View className="flex-row items-center justify-between">
            <Text className="text-text">{t('League name')}</Text>
            <View className="flex-row items-center">
              <Text className="me-2 font-semibold text-text">{league.name}</Text>
              <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={20} height={20} />
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Join Code */}
          <View className="flex-row items-center justify-between">
            <Text className="text-text font-medium">{t('Join Code')}</Text>
            <Pressable className="border border-border rounded-lg px-3 py-1" onPress={handleCopyJoinCode}>
              <Text className="text-text tracking-[2px] text-center">{league.join_code}</Text>
            </Pressable>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Members */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-text">{t('Members')}</Text>
              <Text className="text-text font-semibold">
                {league?.league_members.length || 0} / {league?.max_members}
              </Text>
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Owner */}
          <View className="flex-row justify-between">
            <Text className="text-text">{t('League Owner')}</Text>
            <Text className="text-text font-semibold">{owner?.nickname || 'Unknown'}</Text>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Competition details */}
          <View className="flex-row justify-between">
            <Text className="text-text">{t('Competition')}</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold me-2">{league.competition.name}</Text>
              <LogoBadge source={{ uri: league.competition.logo }} width={18} height={18} />
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between items-center">
            <Text className="text-text">{t('Country')}</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold me-2">{league.competition.area}</Text>
              <MyImage source={{ uri: league.competition.flag || '' }} width={18} height={18} contentFit="contain" />
            </View>
          </View>

          <View className="h-[1px] bg-border" />

          {/* Created date */}
          <View className="flex-row justify-between">
            <Text className="text-text font-medium">{t('Created at')}</Text>
            <Text className="text-muted">{new Date(league.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
