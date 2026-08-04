export type TieBracketSide = 'left' | 'right';

export type TieBracketGeometry = {
  side: TieBracketSide;
  strokeWidth: number;
  gapFromCard: number;
  stubLength: number;
  topStubCenterY: number;
  bottomStubCenterY: number;
  mergeY: number;
  totalHeight: number;
};

const DEFAULT_STROKE = 1.5;
const DEFAULT_GAP_FROM_CARD = 4;
const DEFAULT_STUB_LENGTH = 14;
const DEFAULT_OUTER_MARGIN = 8;
const DEFAULT_MAX_RAIL_WIDTH = 48;

export function computeTieBracketRailWidth(
  screenWidth: number,
  cardWidth: number,
  outerMargin = DEFAULT_OUTER_MARGIN,
  maxRailWidth = DEFAULT_MAX_RAIL_WIDTH,
) {
  return Math.min(maxRailWidth, Math.max(0, screenWidth - outerMargin * 2 - cardWidth));
}

export function computeTieBracketGeometry(params: {
  isRTL: boolean;
  cardHeight: number;
  cardsGap: number;
  strokeWidth?: number;
  gapFromCard?: number;
  stubLength?: number;
}): TieBracketGeometry {
  const strokeWidth = params.strokeWidth ?? DEFAULT_STROKE;
  const gapFromCard = params.gapFromCard ?? DEFAULT_GAP_FROM_CARD;
  const stubLength = params.stubLength ?? DEFAULT_STUB_LENGTH;
  const topStubCenterY = params.cardHeight / 2;
  const bottomStubCenterY = params.cardHeight + params.cardsGap + params.cardHeight / 2;
  return {
    side: params.isRTL ? 'right' : 'left',
    strokeWidth,
    gapFromCard,
    stubLength,
    topStubCenterY,
    bottomStubCenterY,
    mergeY: (topStubCenterY + bottomStubCenterY) / 2,
    totalHeight: params.cardHeight * 2 + params.cardsGap,
  };
}
