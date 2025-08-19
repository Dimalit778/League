import {
  isMatchFinished,
  isMatchInPlay,
  isMatchScheduled,
} from '@/utils/match-utils';
import { MatchFinished, MatchLive, MatchNotStarted } from './MatchStatus';

interface MatchStatusRendererProps {
  match: any;
}

export const MatchInfo = ({ match }: MatchStatusRendererProps) => {
  const isScheduled = isMatchScheduled(match.status_long);
  const isLive = isMatchInPlay(match.status_long);
  const isFinished = isMatchFinished(match.status_long);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return 'football-outline';
      case 'yellow_card':
        return 'card-outline';
      case 'red_card':
        return 'card';
      case 'substitution':
        return 'swap-horizontal-outline';
      default:
        return 'information-circle-outline';
    }
  };

  if (isScheduled) {
    return (
      <MatchNotStarted
        homeScorePrediction={match.homeScorePrediction}
        setHomeScorePrediction={match.setHomeScorePrediction}
        awayScorePrediction={match.awayScorePrediction}
        setAwayScorePrediction={match.setAwayScorePrediction}
        predictionSaved={match.predictionSaved}
        handleSavePrediction={match.handleSavePrediction}
        canPredict={match.canPredict}
        isSaving={match.isSaving}
      />
    );
  }

  if (isLive) {
    return <MatchLive events={match} getEventIcon={getEventIcon} />;
  }

  if (isFinished) {
    return <MatchFinished match={match} />;
  }

  return null;
};
