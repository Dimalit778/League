import { AvatarImage, Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { LeagueWithMembersType } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { Copy, Key, Shield, Trophy, User, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';

const GOLD = '#E3B421';

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
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#1A2740]">{icon}</View>
        <Text className="text-sm text-[#97A7BF]">{label}</Text>
      </View>
      {valueNode ?? (
        <Text className="text-sm font-semibold text-white" numberOfLines={1}>
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
      <View
        className="overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] px-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <View className="flex-row items-center gap-2 border-b border-[#223554] py-3">
          <Shield size={18} color={GOLD} />
          <Text className="text-base font-bold text-white">{t('League details')}</Text>
          {league.owner_id === memberUserId && (
            <Link href="/(app)/(league)/edit" asChild>
              <Pressable className="ml-auto p-1">
                <Text className="text-xs font-semibold text-[#D5B13F]">{t('Edit')}</Text>
              </Pressable>
            </Link>
          )}
        </View>

        <DetailRow icon={<Trophy size={16} color="#97A7BF" />} label={t('League name')} value={league.name} />
        <View className="h-px bg-[#223554]" />
        <DetailRow
          icon={<Users size={16} color="#97A7BF" />}
          label={t('Members')}
          value={String(league.league_members.length)}
        />
        <View className="h-px bg-[#223554]" />
        <DetailRow
          icon={<Key size={16} color="#97A7BF" />}
          label={t('Invite code')}
          onPress={handleCopyJoinCode}
          valueNode={
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold tracking-widest text-[#D5B13F]">{league.join_code}</Text>
              <Copy size={14} color={GOLD} />
            </View>
          }
        />
        <View className="h-px bg-[#223554]" />
        <DetailRow
          icon={<User size={16} color="#97A7BF" />}
          label={t('Created by')}
          valueNode={
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-white">{owner?.nickname ?? t('Unknown')}</Text>
              <View className="h-7 w-7 overflow-hidden rounded-full border border-[#223554]">
                <AvatarImage nickname={owner?.nickname} path={owner?.avatar_url ?? null} />
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
}
