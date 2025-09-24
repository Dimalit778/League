import { useRemoveMember } from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';

import { leagueWithMembers, MemberLeague } from '@/types';
import { useMemo } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, ProfileImage } from '../ui';

interface EditLeagueProps {
  league: leagueWithMembers;
  closeEditMode: () => void;
  handleUpdateLeague: () => void;
  updating: boolean;
  canSave: boolean;
}

const EditLeague = ({
  league,
  closeEditMode,
  handleUpdateLeague,
  updating,
  canSave,
}: EditLeagueProps) => {
  const removeMember = useRemoveMember();
  const { member: currentMember } = useMemberStore();

  // Filter out the current member from the list
  const otherMembers = useMemo(() => {
    if (!league?.league_members || !currentMember?.user_id) return [];
    return league.league_members.filter(
      (member) => member.user_id !== currentMember.user_id
    );
  }, [league?.league_members, currentMember?.user_id]);

  const handleRemoveMember = (deletedMember: MemberLeague) => {
    if (currentMember?.user_id !== league.owner_id) return;
    Alert.alert(
      'Remove Member',
      `Remove ${deletedMember.nickname} from this league?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeMember.mutate({
              leagueId: league.id,
              userId: deletedMember.user_id,
            }),
        },
      ]
    );
  };

  return (
    <View className="flex-grow">
      {/* Members management */}
      <View className="mt-2">
        <Text className="text-text font-semibold mb-2">Other Members</Text>
        <View className="gap-2">
          {otherMembers.length === 0 ? (
            <Text className="text-secondary italic p-2">
              No other members in this league
            </Text>
          ) : (
            otherMembers.map((member) => (
              <View
                key={member.id}
                className="flex-row items-center justify-between py-10 "
              >
                <View className="flex-row items-center">
                  <View className=" mr-2">
                    <ProfileImage
                      memberId={member.id}
                      path={member.avatar_url}
                      size="sm"
                      nickname={member.nickname}
                    />
                  </View>
                  <Text className="text-text font-medium">
                    {member.nickname}
                  </Text>
                </View>
                <Button
                  title={removeMember.isPending ? '...' : 'Remove'}
                  size="sm"
                  variant="error"
                  onPress={() => handleRemoveMember(member as MemberLeague)}
                  disabled={member.user_id === league.id}
                />
              </View>
            ))
          )}
        </View>
      </View>

      {/* Save/Cancel */}
      <View className="flex-row gap-3 mt-4">
        <Button
          title="Save"
          onPress={handleUpdateLeague}
          loading={updating}
          disabled={!canSave || updating}
        />
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => {
            closeEditMode();
          }}
        />
      </View>
    </View>
  );
};

export default EditLeague;
