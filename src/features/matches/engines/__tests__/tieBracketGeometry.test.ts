import {
  buildTieBracketPath,
  computeTieBracketGeometry,
  TIE_BRACKET_RAIL_WIDTH,
} from '../tieBracketGeometry';

describe('computeTieBracketGeometry', () => {
  const base = { cardHeight: 100, cardsGap: 8 };

  it('places connector on the right for LTR and left for RTL', () => {
    expect(computeTieBracketGeometry({ ...base, isRTL: false }).side).toBe('right');
    expect(computeTieBracketGeometry({ ...base, isRTL: true }).side).toBe('left');
  });

  it('centers stubs on each card and merges midway', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: false });
    expect(g.topStubCenterY).toBe(50);
    expect(g.bottomStubCenterY).toBe(100 + 8 + 50);
    expect(g.mergeY).toBe((g.topStubCenterY + g.bottomStubCenterY) / 2);
    expect(g.totalHeight).toBe(100 + 8 + 100);
  });

  it('keeps a positive gap from the card and a usable stub length', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: true });
    expect(g.gapFromCard).toBeGreaterThan(0);
    expect(g.stubLength).toBeGreaterThan(g.gapFromCard);
    expect(g.strokeWidth).toBeGreaterThan(0);
  });
});

describe('buildTieBracketPath', () => {
  const base = { cardHeight: 100, cardsGap: 8 };

  it('draws a C opening to the card then an exit to the LTR (right) edge', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: false });
    const d = buildTieBracketPath(g, TIE_BRACKET_RAIL_WIDTH);
    const spineX = g.gapFromCard + g.stubLength;
    const cardX = g.gapFromCard;

    expect(d).toContain(`M ${cardX} ${g.topStubCenterY}`);
    expect(d).toContain(`H ${spineX}`);
    expect(d).toContain(`V ${g.bottomStubCenterY}`);
    expect(d).toContain(`M ${spineX} ${g.mergeY}`);
    expect(d).toContain(`H ${TIE_BRACKET_RAIL_WIDTH}`);
  });

  it('draws a C opening to the card then an exit to the RTL (left) edge', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: true });
    const d = buildTieBracketPath(g, TIE_BRACKET_RAIL_WIDTH);
    const spineX = TIE_BRACKET_RAIL_WIDTH - g.gapFromCard - g.stubLength;
    const cardX = TIE_BRACKET_RAIL_WIDTH - g.gapFromCard;

    expect(d).toContain(`M ${cardX} ${g.topStubCenterY}`);
    expect(d).toContain(`H ${spineX}`);
    expect(d).toContain(`V ${g.bottomStubCenterY}`);
    expect(d).toContain(`M ${spineX} ${g.mergeY}`);
    expect(d).toContain(`H 0`);
  });

  it('keeps room for a visible exit beyond the spine', () => {
    const g = computeTieBracketGeometry({ ...base, isRTL: false });
    const spineX = g.gapFromCard + g.stubLength;
    expect(TIE_BRACKET_RAIL_WIDTH - spineX).toBeGreaterThan(8);
  });
});
