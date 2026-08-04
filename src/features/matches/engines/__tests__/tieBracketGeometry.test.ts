import { computeTieBracketGeometry, computeTieBracketRailWidth } from '../tieBracketGeometry';

describe('computeTieBracketGeometry', () => {
  const base = { cardHeight: 100, cardsGap: 8 };

  it('places connector on the right for RTL and left for LTR', () => {
    expect(computeTieBracketGeometry({ ...base, isRTL: true }).side).toBe('right');
    expect(computeTieBracketGeometry({ ...base, isRTL: false }).side).toBe('left');
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

describe('computeTieBracketRailWidth', () => {
  it('reserves both outer margins and caps the rail on wide viewports', () => {
    expect(computeTieBracketRailWidth(390, 350)).toBe(24);
    expect(computeTieBracketRailWidth(1024, 600)).toBe(48);
  });

  it('collapses the rail when the card consumes the padded width', () => {
    expect(computeTieBracketRailWidth(390, 374)).toBe(0);
  });
});
