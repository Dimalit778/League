import { Button, Divider, ListItem, LogoBadge, MyImage, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { LeagueWithMembersType } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { Shield, SquarePen } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, View } from 'react-native';

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
    <View className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-3 py-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-subtle">
          <Shield size={18} color={colors.primary} />
        </View>
        <Text variant="body" className="font-semibold flex-1">
          {t('League details')}
        </Text>

        {league.owner_id === memberUserId && (
          <Link href="/(app)/(league)/edit-league" asChild>
            <Button size="icon" variant="outline" accessibilityLabel={t('Edit league')} haptic={false}>
              <SquarePen size={16} color={colors.primary} />
            </Button>
          </Link>
        )}
      </View>

      <Divider />

      <View className="px-3">
        <ListItem
          title={t('League name')}
          divider
          trailing={
            <View className="flex-row items-center">
              <Text tone="muted" className="me-2">
                {league.name}
              </Text>
              <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={20} height={20} />
            </View>
          }
        />

        <ListItem
          title={t('Join Code')}
          divider
          onPress={handleCopyJoinCode}
          trailing={
            <Text variant="bodySmall" tone="muted" className="tracking-[2px] text-center">
              {league.join_code}
            </Text>
          }
        />

        <ListItem
          title={t('Members')}
          divider
          trailing={
            <Text tone="muted">
              {league?.league_members.length || 0} / {league?.max_members}
            </Text>
          }
        />

        <ListItem
          title={t('League Owner')}
          divider
          trailing={<Text tone="muted">{owner?.nickname || 'Unknown'}</Text>}
        />

        <ListItem
          title={t('Competition')}
          divider
          trailing={
            <View className="flex-row items-center">
              <Text tone="muted" className="me-2">
                {league.competition.name}
              </Text>
              <LogoBadge source={{ uri: league.competition.logo }} width={18} height={18} />
            </View>
          }
        />

        <ListItem
          title={t('Country')}
          divider
          trailing={
            <View className="flex-row items-center">
              <Text tone="muted" className="me-2">
                {league.competition.area}
              </Text>
              <MyImage source={{ uri: league.competition.flag || '' }} width={18} height={18} contentFit="contain" />
            </View>
          }
        />

        <ListItem
          title={t('Created at')}
          trailing={<Text tone="muted">{new Date(league.created_at).toLocaleDateString()}</Text>}
        />
      </View>
    </View>
  );
};
