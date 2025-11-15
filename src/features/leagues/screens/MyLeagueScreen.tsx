import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { leagueApi } from '@/features/leagues/api/leagueApi';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useAuthStore } from '@/store/AuthStore';

import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { View } from 'react-native';
import LeagueCard from '../components/LeagueCard';
import { useUpdatePrimaryLeague } from '../hooks/useLeagues';

const MyLeagues = () => {
  const userId = useAuthStore((state) => state.userId);
  const setActiveMember = useMemberStore((s) => s.setActiveMember);
  const {
    data: leagues,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.users.leagues(userId!),
    queryFn: () => leagueApi.getMyLeagues(userId!),
  });

  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague(userId!);

  const handleSetPrimary = async (leagueId: string, isPrimary: boolean) => {
    if (!isPrimary) {
      const primaryLeague = await updatePrimaryLeague(leagueId);
      setActiveMember(primaryLeague);
    }
    router.replace('/(app)/(member)/(tabs)/League');
  };
  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 bg-background p-2">
      {isLoading && <LoadingOverlay />}

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
        {leagues?.map((league) => (
          <LeagueCard key={league.league.id} item={league} handleSetPrimary={handleSetPrimary} />
        ))}
      </View>
    </View>
  );
};

export default MyLeagues;
