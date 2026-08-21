import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type ArrowIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  direction?: 'back' | 'forward';
};

export function ArrowIcon({ size = 24, color, strokeWidth = 1.5, direction = 'back' }: ArrowIconProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const iconColor = color ?? colors.muted;
  const pointRight = direction === 'forward' ? !isRTL : isRTL;

  return pointRight ? (
    <ChevronRight size={size} color={iconColor} strokeWidth={strokeWidth} />
  ) : (
    <ChevronLeft size={size} color={iconColor} strokeWidth={strokeWidth} />
  );
}
