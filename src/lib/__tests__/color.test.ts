import { setColorAlpha } from '../color';

describe('setColorAlpha', () => {
  it('keeps RGB channels intact when making an rgba color transparent', () => {
    expect(setColorAlpha('rgba(255, 248, 230, 0.9)', 0)).toBe('rgba(255, 248, 230, 0)');
  });

  it('supports rgb and hex colors', () => {
    expect(setColorAlpha('rgb(255, 255, 255)', 0.25)).toBe('rgba(255, 255, 255, 0.25)');
    expect(setColorAlpha('#7A5800', 0)).toBe('rgba(122, 88, 0, 0)');
  });

  it('leaves unsupported color formats unchanged', () => {
    expect(setColorAlpha('white', 0)).toBe('white');
  });
});
