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
  const fontScaleExtra = Math.max(0, fontScale - 1) * 40;

  const heroHeight = presentation.canPredict
    ? Math.min(
      height * 0.4,
      Math.max(
        height * 0.52 + fontScaleExtra,
        isTablet ? 400 : 340,
      ),
    )
    : Math.min(
      height * 0.35,
      Math.max(
        height * 0.5 + fontScaleExtra,
        isTablet ? 360 : 260,
      ),
    );

  const heroGradientColors = isDark
    ? ([
      "rgba(4,8,20,0.99)",
      "rgba(4,8,19,0.78)",
      "rgba(3,8,18,0.62)",
      colors.background,
    ] as const)
    : ([
      "rgba(4,8,20,0.99)",
      "rgba(4,8,19,0.74)",
      "rgba(3,8,18,0.52)",
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
