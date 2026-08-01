// DirectionalIcon.tsx
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type DirectionalIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function DirectionalIcon({ size = 24, color, strokeWidth = 1.5 }: DirectionalIconProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const iconColor = color ?? colors.muted;
  console.log('isRTL', isRTL);

  return isRTL ? (
    <ChevronLeft size={size} color={iconColor} strokeWidth={strokeWidth} />
  ) : (
    <ChevronRight size={size} color={iconColor} strokeWidth={strokeWidth} />
  );
}
