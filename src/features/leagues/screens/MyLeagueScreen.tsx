import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';

import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import MyLeagueCard from '../components/MyLeagueCard';
import { useMyLeagues, useUpdatePrimaryLeague } from '../hooks/useLeagues';

const MyLeagues = () => {
  const { data: leagues, isLoading, error } = useMyLeagues();
  const { mutate: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const setActiveMember = useMemberStore((s) => s.setActiveMember);

  const handleSetPrimary = async (leagueId: string, isPrimary: boolean) => {
    if (isPrimary) return router.replace('/(app)/(member)/(tabs)/League');

    const selectedLeague = leagues?.find((l) => l.league.id === leagueId);

    if (selectedLeague) {
      setActiveMember(selectedLeague);
      router.replace('/(app)/(member)/(tabs)/League');
      updatePrimaryLeague({ leagueId });
    }
  };

  if (isLoading || !leagues) return <LoadingOverlay />;
  if (error) return <Error error={error as Error} />;

  return (
    <View className="flex-1 bg-background p-2">
      <View className="flex-row justify-between px-2">
        <Button
          title="Create League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/select-competition')}
        />
        <Button
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/join-league')}
        />
      </View>
      <View className="flex-1 gap-3 p-2 mt-4">
        {leagues.map((league) => (
          <MyLeagueCard
            key={league.league.id}
            item={league}
            handleSetPrimary={() => handleSetPrimary(league.league.id, league.is_primary)}
          />
        ))}
        {leagues.length === 0 && (
          <View className="flex-1 pt-10">
            <Text className="text-center text-muted font-nunito-bold text-lg">
              Create or join a league to get started
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MyLeagues;
