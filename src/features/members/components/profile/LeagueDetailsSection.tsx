import { Card, Divider, MyImage } from '@/components/ui';
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
    <Card>
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-subtle">
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

      <Divider className="my-3" />

      <View className="gap-3">
        {/* League Name */}
        <View className="flex-row items-center justify-between">
          <Text>{t('League name')}</Text>
          <View className="flex-row items-center">
            <Text tone="muted" className="me-2">
              {league.name}
            </Text>
            <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={20} height={20} />
          </View>
        </View>
        <Divider />

        {/* Join Code */}
        <View className="flex-row items-center justify-between">
          <Text>{t('Join Code')}</Text>
          <Pressable className="border border-border rounded-lg px-3 py-1" onPress={handleCopyJoinCode}>
            <Text variant="bodySmall" tone="muted" className="tracking-[2px] text-center">
              {league.join_code}
            </Text>
          </Pressable>
        </View>
        <Divider />

        {/* Members */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text>{t('Members')}</Text>
            <Text tone="muted">
              {league?.league_members.length || 0} / {league?.max_members}
            </Text>
          </View>
        </View>
        <Divider />

        {/* Owner */}
        <View className="flex-row justify-between">
          <Text>{t('League Owner')}</Text>
          <Text tone="muted">{owner?.nickname || 'Unknown'}</Text>
        </View>
        <Divider />

        {/* Competition details */}
        <View className="flex-row justify-between">
          <Text>{t('Competition')}</Text>
          <View className="flex-row items-center">
            <Text tone="muted" className="me-2">
              {league.competition.name}
            </Text>
            <LogoBadge source={{ uri: league.competition.logo }} width={18} height={18} />
          </View>
        </View>
        <Divider />

        <View className="flex-row justify-between items-center">
          <Text>{t('Country')}</Text>
          <View className="flex-row items-center">
            <Text tone="muted" className="me-2">
              {league.competition.area}
            </Text>
            <MyImage source={{ uri: league.competition.flag || '' }} width={18} height={18} contentFit="contain" />
          </View>
        </View>

        <Divider />

        {/* Created date */}
        <View className="flex-row justify-between">
          <Text>{t('Created at')}</Text>
          <Text tone="muted">{new Date(league.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
    </Card>
  );
};
