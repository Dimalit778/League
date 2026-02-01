import { hexToRgba } from '../colorHexToRgba';

describe('hexToRgba', () => {
  it('converts black hex to rgba', () => {
    expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('converts white hex to rgba', () => {
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  it('converts a color hex to rgba with full opacity', () => {
    expect(hexToRgba('#ff5733', 1)).toBe('rgba(255, 87, 51, 1)');
  });

  it('applies partial opacity', () => {
    expect(hexToRgba('#ff5733', 0.5)).toBe('rgba(255, 87, 51, 0.5)');
  });

  it('applies zero opacity', () => {
    expect(hexToRgba('#ff5733', 0)).toBe('rgba(255, 87, 51, 0)');
  });

  it('handles uppercase hex', () => {
    expect(hexToRgba('#FF5733', 0.8)).toBe('rgba(255, 87, 51, 0.8)');
  });
});
