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
  'primaryForeground',
  'primarySoft',
  'background',
  'backgroundSecondary',
  'surface',
  'surfaceSoft',
  'surfaceElevated',
  'text',
  'textSecondary',
  'muted',
  'mutedForeground',
  'border',
  'borderStrong',
  'success',
  'successSoft',
  'warning',
  'warningSoft',
  'error',
  'errorSoft',
  'info',
  'infoSoft',
  'overlay',
];

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

  it('keeps compatibility aliases mapped to semantic colors', () => {
    expect(themeTokens.light.colors.soft).toBe(themeTokens.light.colors.backgroundSecondary);
    expect(themeTokens.dark.colors.surfaceSecondary).toBe(themeTokens.dark.colors.surfaceSoft);
    expect(themeTokens.dark.colors.secondary).toBe(themeTokens.dark.colors.info);
  });

  it('uses the font family names registered by Expo', () => {
    expect(themeTokens.light.fonts).toEqual({
      heading: 'Teko_400Regular',
      headingBold: 'Teko_700Bold',
    });
  });
});

describe('NativeWind variables', () => {
  it('maps every semantic color to a CSS variable', () => {
    const variables = getNativeWindVariables(themeTokens.dark);

    expect(Object.keys(variables)).toHaveLength(24);
    expect(variables['--color-primary']).toBe(themeTokens.dark.colors.primary);
    expect(variables['--color-background-secondary']).toBe(themeTokens.dark.colors.backgroundSecondary);
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
    expect(tokens).toHaveProperty('fonts');
    expect(tokens).toHaveProperty('spacing');
    expect(tokens).toHaveProperty('radius');
  });
});
