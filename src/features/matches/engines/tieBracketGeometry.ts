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

/** Rail wide enough for gap + stub + visible exit merge. */
export const TIE_BRACKET_RAIL_WIDTH = 52;


const DEFAULT_STROKE = 2;
const DEFAULT_GAP_FROM_CARD = 4;
const DEFAULT_STUB_LENGTH = 14;

export function computeTieBracketGeometry(params: {
  isRTL: boolean;
  cardHeight: number;
  strokeWidth?: number;
  gapFromCard?: number;
  stubLength?: number;
}): TieBracketGeometry {
  const strokeWidth = params.strokeWidth ?? DEFAULT_STROKE;
  const gapFromCard = params.gapFromCard ?? DEFAULT_GAP_FROM_CARD;
  const stubLength = params.stubLength ?? DEFAULT_STUB_LENGTH;
  const topStubCenterY = params.cardHeight / 2;
  const bottomStubCenterY = params.cardHeight + params.cardHeight / 2;
  return {
    // LTR: rail on the right (cards → merge → edge). RTL: rail on the left (same reading order).
    side: params.isRTL ? 'left' : 'right',
    strokeWidth,
    gapFromCard,
    stubLength,
    topStubCenterY,
    bottomStubCenterY,
    mergeY: (topStubCenterY + bottomStubCenterY) / 2,
    totalHeight: params.cardHeight * 2,
  };
}

/** SVG path for a C that opens toward the card, then exits to the screen edge. */
export function buildTieBracketPath(
  geometry: TieBracketGeometry,
  railWidth: number,
): string {
  const stub = Math.min(geometry.stubLength, Math.max(0, railWidth - geometry.gapFromCard - 8));
  const spineX =
    geometry.side === 'right'
      ? geometry.gapFromCard + stub
      : railWidth - geometry.gapFromCard - stub;
  const cardX =
    geometry.side === 'right' ? geometry.gapFromCard : railWidth - geometry.gapFromCard;
  const edgeX = geometry.side === 'right' ? railWidth : 0;

  // C: card → spine → other card, then exit spine → edge
  return [
    `M ${cardX} ${geometry.topStubCenterY}`,
    `H ${spineX}`,
    `V ${geometry.bottomStubCenterY}`,
    `H ${cardX}`,
    `M ${spineX} ${geometry.mergeY}`,
    `H ${edgeX}`,
  ].join(' ');
}
