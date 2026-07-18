import { AvatarImage, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { LeagueWithMembersType } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { Copy, Key, Shield, Trophy, User, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';

type ProfileLeagueDetailsProps = {
  league: LeagueWithMembersType;
  memberUserId: string;
};

function DetailRow({
  icon,
  label,
  value,
  valueNode,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-border">{icon}</View>
        <Text>{label}</Text>
      </View>
      {valueNode ?? (
        <Text semibold numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}

export function ProfileLeagueDetails({ league, memberUserId }: ProfileLeagueDetailsProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const owner = useMemo(
    () => league.league_members.find((member) => member.user_id === league.owner_id),
    [league.league_members, league.owner_id],
  );

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code);
      Alert.alert(t('Copied!'), t('Join code copied to clipboard.'));
    }
  };

  return (
    <View className="mx-3 mt-4">
      <View className="overflow-hidden rounded-2xl border border-border bg-surface px-4">
        <View className="flex-row items-center gap-2 border-b border-border py-3">
          <Shield size={18} color={colors.primary} />
          <Text semibold>{t('League details')}</Text>
          {league.owner_id === memberUserId && (
            <Link href="/(app)/(league)/edit" asChild>
              <Pressable className="ml-auto p-1">
                <Text semibold className="text-primary">
                  {t('Edit')}
                </Text>
              </Pressable>
            </Link>
          )}
        </View>

        <DetailRow icon={<Trophy size={18} color={colors.muted} />} label={t('League name')} value={league.name} />
        <View className="h-px bg-border" />
        <DetailRow
          icon={<Users size={18} color={colors.muted} />}
          label={t('Members')}
          value={String(league.league_members.length)}
        />
        <View className="h-px bg-border" />
        <DetailRow
          icon={<Key size={18} color={colors.muted} />}
          label={t('Invite code')}
          onPress={handleCopyJoinCode}
          valueNode={
            <View className="flex-row items-center gap-2">
              <Text caption semibold className=" tracking-widest text-primary">
                {league.join_code}
              </Text>
              <Copy size={14} color={colors.primary} />
            </View>
          }
        />
        <View className="h-px bg-border" />
        <DetailRow
          icon={<User size={18} color={colors.muted} />}
          label={t('Created by')}
          valueNode={
            <View className="flex-row items-center gap-2">
              <Text>{owner?.nickname ?? t('Unknown')}</Text>
              <View className="h-8 w-8 overflow-hidden rounded-full border border-border">
                <AvatarImage nickname={owner?.nickname} path={owner?.avatar_url ?? null} />
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
}
