// DirectionalIcon.tsx
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type DirectionalIconProps = {
  size?: number;
  color?: string;
};

export function DirectionalIcon({ size = 24 }: DirectionalIconProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();

  return isRTL ? (
    <ChevronLeft size={size} color={colors.muted} strokeWidth={1.5} />
  ) : (
    <ChevronRight size={size} color={colors.muted} strokeWidth={1.5} />
  );
}
