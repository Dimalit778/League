import { Error, LoadingOverlay } from '@/components/layout';

import FinishContent from './components/finished-content';
import MatchHeader from './components/match-header';
import ScheduledContent from './components/scheduled-content';

import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { MatchType } from '@/types';

type RouteParams = {
  match?: string;
};

function StatusContent({ match }: { match: MatchType }) {
  switch (match.status) {
    case 'TIMED':
    case 'SCHEDULED':
      if (new Date(match.kick_off) > new Date()) {
        return <ScheduledContent match={match} />;
      }
    case 'IN_PLAY':
      return <FinishContent match_id={match.id} />;

    case 'FINISHED':
      return <FinishContent match_id={match.id} />;
  }
}

export default function Match() {
  const { match: matchParam } = useLocalSearchParams<RouteParams>();
  let match: MatchType | null = null;
  if (typeof matchParam === 'string') {
    try {
      match = JSON.parse(matchParam) as MatchType;
    } catch (err) {
      return <Error error={err as Error} />;
    }
  }

  if (!match) {
    return <LoadingOverlay />;
  }

  return (
    <View className="flex-1 bg-background">
      <MatchHeader match={match} />
      <StatusContent match={match} />
    </View>
  );
}
