import { renderHook } from '@testing-library/react-native';
import { useThemeTokens } from '../useThemeTokens';

jest.unmock('@/hooks/useThemeTokens');

const mockThemeState = { theme: 'dark' as const };

jest.mock('@/store/ThemeStore', () => ({
  useThemeStore: (selector: (state: typeof mockThemeState) => unknown) => selector(mockThemeState),
}));

describe('useThemeTokens', () => {
  it('returns the active theme and all runtime token groups', () => {
    const { result } = renderHook(() => useThemeTokens());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.colors.background).toBe('#071525');
    expect(result.current.spacing[4]).toBe(16);
    expect(result.current.radius.lg).toBe(16);
    expect(result.current.gradients.hero).toHaveLength(3);
    expect(result.current.effects.cardGlow).toEqual(expect.any(String));
    expect(result.current.fonts.headingBold).toBe('Teko_700Bold');
  });
});
