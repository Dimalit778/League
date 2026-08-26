// Layout math for the match card. Kept out of MatchCardBg.tsx so that component
// file only exports components (Fast Refresh preserves state; see
// react-doctor/only-export-components).

export const MATCH_CARD_VIEWBOX_WIDTH = 360;
export const MATCH_CARD_VIEWBOX_HEIGHT = 110;

export const MATCH_CARD_HORIZONTAL_PADDING = 32;
const MATCH_CARD_HEIGHT_SCALE = 0.945;
const MATCH_CARD_COMPACT_HEIGHT_SCALE = 0.82;
const MATCH_CARD_GAP = 8;
const MATCH_CARD_CENTER_WIDTH = 82;
const MATCH_CARD_LOGO_MAX = 44;

export const MATCH_CARD_LAYOUT = {
  dateTabCenterY: 18 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabTopY: 76 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabHeight: 28 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentTopY: 30 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentBottomY: 82 / MATCH_CARD_VIEWBOX_HEIGHT,

  dateTabTextOffset: 6,
} as const;

export function getMatchCardMetrics(screenWidth: number, compact = false) {
  const width = Math.min(screenWidth - MATCH_CARD_HORIZONTAL_PADDING, 450);

  const height = Math.round(
    width *
      (MATCH_CARD_VIEWBOX_HEIGHT / MATCH_CARD_VIEWBOX_WIDTH) *
      (compact ? MATCH_CARD_COMPACT_HEIGHT_SCALE : MATCH_CARD_HEIGHT_SCALE),
  );

  const gap = MATCH_CARD_GAP;
  const centerWidth = MATCH_CARD_CENTER_WIDTH;

  const teamWidth = (width - centerWidth - gap * 2) / 2;

  const contentTop = height * MATCH_CARD_LAYOUT.contentTopY;

  const contentHeight = height * (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);

  const headerTop = height * MATCH_CARD_LAYOUT.dateTabCenterY - MATCH_CARD_LAYOUT.dateTabTextOffset;

  const predictionTop = height * MATCH_CARD_LAYOUT.predictionTabTopY;
  const predictionHeight = height * MATCH_CARD_LAYOUT.predictionTabHeight;

  const logoBoxSize = Math.min(teamWidth * 0.7, height * 0.45, MATCH_CARD_LOGO_MAX);

  return {
    width,
    height,
    gap,
    centerWidth,
    teamWidth,
    contentTop,
    contentHeight,
    headerTop,
    predictionTop,
    predictionHeight,
    logoBoxSize,
  };
}
