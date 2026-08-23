import type { MatchDetails } from "@/features/matches/types";
import { useMemberId } from "@/store/PrimaryLeagueStore";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { deriveMatchPresentation } from "../model/matchPresentation";

export function useMatchDetailsController(match: MatchDetails) {
  const memberId = useMemberId();
  const { width } = useWindowDimensions();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const presentation = deriveMatchPresentation({
    status: match.status,
    kickOff: match.kick_off,
  });
  const memberPrediction = (match.predictions ?? []).find((prediction) =>
    prediction.league_member?.id === memberId
  );

  return {
    isTablet: width >= 768,
    presentation,
    memberPrediction,
    showSuccessAnimation,
    showSuccess: () => setShowSuccessAnimation(true),
    hideSuccess: () => setShowSuccessAnimation(false),
  };
}
