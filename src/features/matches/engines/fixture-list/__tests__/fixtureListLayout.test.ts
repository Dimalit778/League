import {
  FIXTURE_CHIP_MARGIN,
  FIXTURE_CHIP_WIDTH,
  FIXTURE_ITEM_SIZE,
  getCenteredFixtureOffset,
  getFixtureItemLayout,
  getFixtureListIndex,
} from '../fixtureListLayout';

describe('fixtureListLayout', () => {
  it('matches NativeWind mx-2 chip width', () => {
    expect(FIXTURE_CHIP_WIDTH).toBe(70);
    expect(FIXTURE_CHIP_MARGIN).toBe(8);
    expect(FIXTURE_ITEM_SIZE).toBe(86);
  });

  it('keeps index 0 when the first fixture is selected', () => {
    expect(getFixtureListIndex([1, 2, 3], 1)).toBe(0);
  });

  it('falls back to 0 when the selected fixture is missing', () => {
    expect(getFixtureListIndex([1, 2, 3], 9)).toBe(0);
  });

  it('lays out items with a stable offset', () => {
    expect(getFixtureItemLayout(2)).toEqual({ length: 86, offset: 172, index: 2 });
  });

  it('does not pull fixture 1 off the start edge when centering', () => {
    expect(getCenteredFixtureOffset(0, 390, 38)).toBe(0);
  });

  it('centers a mid-list fixture and clamps to the end', () => {
    expect(getCenteredFixtureOffset(10, 390, 38)).toBe(10 * 86 - (390 - 86) / 2);
    expect(getCenteredFixtureOffset(37, 390, 38)).toBe(38 * 86 - 390);
  });
});
