import {
  cn,
  getNativeWindVariables,
  getThemeColor,
  getThemeTokens,
  themeTokens,
  type ThemeColors,
} from '../nativewind/nativeWind';

const semanticColorKeys: (keyof ThemeColors)[] = [
  'primary',
  'onPrimary',
  'background',
  'surface',
  'subtle',
  'text',
  'muted',
  'border',
  'success',
  'warning',
  'error',
  'danger',
  'info',
  'overlay',
];

const relativeLuminance = (hex: string) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (foreground: string, background: string) => {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
};

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
    semanticColorKeys.forEach((key) => expect(colors).toHaveProperty(key));
  });

  it('dark theme has all required colors', () => {
    const colors = themeTokens.dark.colors;
    semanticColorKeys.forEach((key) => expect(colors).toHaveProperty(key));
  });

  it('light and dark themes have different background colors', () => {
    expect(themeTokens.light.colors.background).not.toBe(themeTokens.dark.colors.background);
  });

  it('both themes have color definitions', () => {
    expect(themeTokens.light.colors).toHaveProperty('primary');
    expect(themeTokens.dark.colors).toHaveProperty('primary');
  });

  it('keeps the palette intentionally small', () => {
    expect(Object.keys(themeTokens.light.colors)).toEqual(semanticColorKeys);
    expect(Object.keys(themeTokens.dark.colors)).toEqual(semanticColorKeys);
  });

  it.each(['light', 'dark'] as const)('keeps semantic text colors WCAG AA on the %s surface', (theme) => {
    const { colors } = themeTokens[theme];
    const textColors = ['primary', 'text', 'muted', 'success', 'warning', 'error', 'info'] as const;

    textColors.forEach((color) => expect(contrastRatio(colors[color], colors.surface)).toBeGreaterThanOrEqual(4.5));
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('NativeWind variables', () => {
  it('maps every semantic color to a CSS variable', () => {
    const variables = getNativeWindVariables(themeTokens.dark);

    expect(Object.keys(variables)).toHaveLength(semanticColorKeys.length);
    expect(variables['--color-primary']).toBe(themeTokens.dark.colors.primary);
    expect(variables['--color-subtle']).toBe(themeTokens.dark.colors.subtle);
    expect(variables['--color-overlay']).toBe(themeTokens.dark.colors.overlay);
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

  it('includes all runtime token groups', () => {
    const tokens = getThemeTokens('dark');
    expect(tokens).toHaveProperty('colors');
    expect(tokens).toHaveProperty('gradients');
    expect(tokens).toHaveProperty('spacing');
    expect(tokens).toHaveProperty('radius');
  });
});
