import { useIsRTL } from '@/providers/LanguageProvider';
import { ViewStyle } from 'react-native';

/**
 * Hook to get RTL-aware styles
 * Automatically reverses flexDirection for row layouts when RTL is enabled
 */
export function useRTLStyles() {
  const isRTL = useIsRTL();

  const getRTLStyle = (style: ViewStyle): ViewStyle => {
    if (!isRTL) return style;

    // Reverse flexDirection for row layouts
    if (style.flexDirection === 'row') {
      return { ...style, flexDirection: 'row-reverse' };
    }
    if (style.flexDirection === 'row-reverse') {
      return { ...style, flexDirection: 'row' };
    }

    return style;
  };

  return {
    isRTL,
    getRTLStyle,
    // Common RTL-aware flex row style
    flexRow: isRTL ? { flexDirection: 'row-reverse' as const } : { flexDirection: 'row' as const },
    // Common RTL-aware flex row reverse style
    flexRowReverse: isRTL ? { flexDirection: 'row' as const } : { flexDirection: 'row-reverse' as const },
  };
}
