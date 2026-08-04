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
