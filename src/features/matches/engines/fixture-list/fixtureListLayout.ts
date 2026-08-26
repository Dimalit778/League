export const FIXTURE_CHIP_WIDTH = 70;
/** Matches NativeWind `mx-2` (8px each side). */
export const FIXTURE_CHIP_MARGIN = 8;
export const FIXTURE_ITEM_SIZE = FIXTURE_CHIP_WIDTH + FIXTURE_CHIP_MARGIN * 2;

export function getFixtureListIndex(fixtures: number[], selected: number): number {
  const index = fixtures.findIndex((fixture) => fixture === selected);
  return index < 0 ? 0 : index;
}

export function getFixtureItemLayout(index: number) {
  return {
    length: FIXTURE_ITEM_SIZE,
    offset: FIXTURE_ITEM_SIZE * index,
    index,
  };
}

export function getCenteredFixtureOffset(index: number, viewportWidth: number, itemCount: number): number {
  const contentWidth = itemCount * FIXTURE_ITEM_SIZE;
  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  const centered = index * FIXTURE_ITEM_SIZE - (viewportWidth - FIXTURE_ITEM_SIZE) / 2;
  return Math.min(maxOffset, Math.max(0, centered));
}
