import { LoadingOverlay, Screen, TopBar } from '@/components/layout';
import LeagueContent from '@/components/profile/LeagueContent';
import { ProfileImage } from '@/components/ui';
import { useGetLeagueAndMembers } from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

export default function Profile() {
  const { member, setMember } = useMemberStore();

  const { data: leagueWithMembers, isLoading } = useGetLeagueAndMembers(
    member?.league?.id as string
  );

  const isOwner = useMemo(
    () =>
      Boolean(
        member?.user_id &&
          leagueWithMembers?.owner?.user_id &&
          member.user_id === leagueWithMembers.owner.user_id
      ),
    [member?.user_id, leagueWithMembers?.owner?.user_id]
  );

  return (
    <Screen>
      {isLoading && <LoadingOverlay />}
      <TopBar />
      <View className="bg-surface rounded-xl border border-border p-4 mb-4">
        <View className="flex-row items-center">
          <ProfileImage
            imageUrl={member?.avatar_url || ''}
            nickname={member?.nickname || ''}
            size="xl"
          />
          <View className="ml-4 flex-1">
            <Text className="text-text text-xl font-bold mb-2">
              {member?.nickname}
            </Text>
          </View>
        </View>
      </View>

      {leagueWithMembers && (
        <LeagueContent league={leagueWithMembers} isOwner={isOwner} />
      )}
    </Screen>
  );
}
