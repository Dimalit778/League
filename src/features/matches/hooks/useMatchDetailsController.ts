import type { MatchDetails } from "@/features/matches/types";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useMemberId } from "@/store/PrimaryLeagueStore";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deriveMatchPresentation } from "../model/matchPresentation";

export function useMatchDetailsController(match: MatchDetails) {
  const memberId = useMemberId();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeTokens();
  const { height, width, fontScale } = useWindowDimensions();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const presentation = deriveMatchPresentation({
    status: match.status,
    kickOff: match.kick_off,
  });
  const memberPrediction = (match.predictions ?? []).find((prediction) =>
    prediction.league_member?.id === memberId
  );
  const isTablet = width >= 768;
  const heroHeight = presentation.canPredict
    ? Math.min(
      height * 0.46,
      Math.max(
        height * 0.43 + Math.max(0, fontScale - 1) * 72,
        isTablet ? 400 : 340,
      ),
    )
    : Math.min(
      height * 0.34,
      Math.max(
        height * 0.36 + Math.max(0, fontScale - 1) * 64,
        isTablet ? 360 : 240,
      ),
    );
  const heroGradientColors = isDark
    ? ([
      "rgba(4,10,20,0.38)",
      "rgba(4,10,20,0.5)",
      "rgba(4,10,20,0.72)",
      colors.background,
    ] as const)
    : ([
      "rgba(15,23,42,0.58)",
      "rgba(15,23,42,0.44)",
      "rgba(248,249,247,0.3)",
      colors.background,
    ] as const);

  return {
    colors,
    insets,
    isTablet,
    heroHeight,
    heroGradientColors,
    presentation,
    memberPrediction,
    showSuccessAnimation,
    showSuccess: () => setShowSuccessAnimation(true),
    hideSuccess: () => setShowSuccessAnimation(false),
  };
}
