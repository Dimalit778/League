import { Error } from '@/components/layout';
import FinishContent from '@/components/matchDetails/FinishContent';
import MatchHeader from '@/components/matchDetails/MatchHeader';
import ScheduledContent from '@/components/matchDetails/ScheduledContent';
import SkeletonMatchDetails from '@/components/matchDetails/SkeletonMatchDetails';
import { Tables } from '@/types/database.types';

import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

type MatchType = Tables<'matches'> & {
  home_team: Tables<'teams'>;
  away_team: Tables<'teams'>;
  predictions: Tables<'predictions'>[] | null;
};

export default function MatchDetails() {
  const params = useLocalSearchParams();
  const { match: matchParam } = params;

  let match: MatchType | null = null;

  try {
    if (matchParam) {
      match = JSON.parse(matchParam as string) as MatchType;
    }
  } catch (e) {
    return <Error error={e as Error} />;
  }

  if (!match) return <SkeletonMatchDetails />;

  const StatusContent = ({ match }: { match: MatchType }) => {
    switch (match.status) {
      case 'TIMED':
        if (new Date(match.kick_off) > new Date()) {
          return <ScheduledContent match={match} />;
        }
      case 'IN_PLAY':
        return <FinishContent match_id={match.id} />;

      case 'FINISHED':
        return <FinishContent match_id={match.id} />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <MatchHeader match={match} />
      <StatusContent match={match} />
    </View>
  );
}
