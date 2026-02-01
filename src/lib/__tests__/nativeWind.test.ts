import { cn, getThemeColor, getThemeTokens, themeTokens } from '../nativeWind';

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('text-sm', 'font-bold');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).toContain('base');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('handles undefined and null inputs', () => {
    const result = cn('base', undefined, null);
    expect(result).toBe('base');
  });

  it('merges conflicting tailwind classes', () => {
    // tailwind-merge should resolve conflicts
    const result = cn('text-sm', 'text-lg');
    expect(result).toContain('text-lg');
  });
});

describe('themeTokens', () => {
  it('has light and dark themes', () => {
    expect(themeTokens).toHaveProperty('light');
    expect(themeTokens).toHaveProperty('dark');
  });

  it('light theme has all required colors', () => {
    const colors = themeTokens.light.colors;
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('secondary');
    expect(colors).toHaveProperty('background');
    expect(colors).toHaveProperty('surface');
    expect(colors).toHaveProperty('border');
    expect(colors).toHaveProperty('text');
    expect(colors).toHaveProperty('muted');
    expect(colors).toHaveProperty('error');
    expect(colors).toHaveProperty('success');
  });

  it('dark theme has all required colors', () => {
    const colors = themeTokens.dark.colors;
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('secondary');
    expect(colors).toHaveProperty('background');
    expect(colors).toHaveProperty('surface');
    expect(colors).toHaveProperty('border');
    expect(colors).toHaveProperty('text');
    expect(colors).toHaveProperty('muted');
    expect(colors).toHaveProperty('error');
    expect(colors).toHaveProperty('success');
  });

  it('light and dark themes have different background colors', () => {
    expect(themeTokens.light.colors.background).not.toBe(themeTokens.dark.colors.background);
  });

  it('both themes have font definitions', () => {
    expect(themeTokens.light.fonts).toHaveProperty('nunito');
    expect(themeTokens.light.fonts).toHaveProperty('nunitoBold');
    expect(themeTokens.dark.fonts).toHaveProperty('nunito');
    expect(themeTokens.dark.fonts).toHaveProperty('nunitoBold');
  });
});

describe('getThemeColor', () => {
  it('returns the correct light primary color', () => {
    expect(getThemeColor('light', 'primary')).toBe(themeTokens.light.colors.primary);
  });

  it('returns the correct dark primary color', () => {
    expect(getThemeColor('dark', 'primary')).toBe(themeTokens.dark.colors.primary);
  });

  it('returns different colors for light and dark themes', () => {
    expect(getThemeColor('light', 'background')).not.toBe(getThemeColor('dark', 'background'));
  });
});

describe('getThemeTokens', () => {
  it('returns light theme tokens', () => {
    const tokens = getThemeTokens('light');
    expect(tokens).toBe(themeTokens.light);
  });

  it('returns dark theme tokens', () => {
    const tokens = getThemeTokens('dark');
    expect(tokens).toBe(themeTokens.dark);
  });

  it('includes colors and fonts', () => {
    const tokens = getThemeTokens('dark');
    expect(tokens).toHaveProperty('colors');
    expect(tokens).toHaveProperty('fonts');
  });
});
