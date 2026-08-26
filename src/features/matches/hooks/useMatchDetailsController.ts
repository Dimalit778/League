import type { MatchDetails } from '@/features/matches/types';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { dateFormat, formatTime } from '@/utils/formats';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { deriveMatchPresentation } from '../model/matchPresentation';

export function useMatchDetailsController(match: MatchDetails) {
  const memberId = useMemberId();
  const { width } = useWindowDimensions();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const memberPrediction = (match.predictions ?? []).find((prediction) => prediction.league_member?.id === memberId);
  const presentation = deriveMatchPresentation({
    status: match.status,
    kickOff: match.kick_off,
    date: dateFormat(match.kick_off),
    time: formatTime(match.kick_off),
    homeScore: match.score?.fullTime?.home,
    awayScore: match.score?.fullTime?.away,
    prediction: memberPrediction
      ? { home: memberPrediction.home_score, away: memberPrediction.away_score }
      : null,
  });

  return {
    isTablet: width >= 768,
    presentation,
    memberPrediction,
    showSuccessAnimation,
    showSuccess: () => setShowSuccessAnimation(true),
    hideSuccess: () => setShowSuccessAnimation(false),
  };
}
