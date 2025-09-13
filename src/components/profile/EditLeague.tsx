import { useRemoveMember } from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { leagueWithMembers } from '@/types/league.types';
import { useMemo } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, ProfileImage } from '../ui';

interface EditLeagueProps {
  league: leagueWithMembers;
  closeEditMode: () => void;
  handleUpdateLeague: () => void;
  updating: boolean;
}

const EditLeague = ({
  league,
  closeEditMode,
  handleUpdateLeague,
  updating,
}: EditLeagueProps) => {
  const { mutate: removeMember, isPending: removing } = useRemoveMember();
  const { member: currentMember } = useMemberStore();

  // Filter out the current member from the list
  const otherMembers = useMemo(() => {
    if (!league?.league_members || !currentMember?.user_id) return [];
    return league.league_members.filter(
      (member) => member.user_id !== currentMember.user_id
    );
  }, [league?.league_members, currentMember?.user_id]);

  return (
    <>
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
                className="flex-row items-center justify-between p-2 border border-border rounded-md"
              >
                <View className="flex-row items-center">
                  <View className=" mr-2">
                    <ProfileImage
                      size="sm"
                      imageUrl={member.avatar_url || ''}
                      nickname={member.nickname}
                    />
                  </View>
                  <Text className="text-text font-medium">
                    {member.nickname}
                  </Text>
                </View>
                <Button
                  title={removing ? '...' : 'Remove'}
                  size="sm"
                  variant="error"
                  onPress={() =>
                    Alert.alert(
                      'Remove Member',
                      `Remove ${member.nickname} from this league?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () =>
                            removeMember({
                              leagueId: league.id,
                              userId: member.user_id,
                            }),
                        },
                      ]
                    )
                  }
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
          title={updating ? 'Saving...' : 'Save'}
          onPress={() => {
            handleUpdateLeague();
            closeEditMode();
          }}
        />
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => {
            closeEditMode();
          }}
        />
      </View>
    </>
  );
};

export default EditLeague;
