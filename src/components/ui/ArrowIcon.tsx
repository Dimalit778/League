import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type ArrowIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function ArrowIcon({ size = 24, color, strokeWidth = 1.5 }: ArrowIconProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const iconColor = color ?? colors.muted;

  return isRTL ? (
    <ChevronRight size={size} color={iconColor} strokeWidth={strokeWidth} />
  ) : (
    <ChevronLeft size={size} color={iconColor} strokeWidth={strokeWidth} />
  );
}
