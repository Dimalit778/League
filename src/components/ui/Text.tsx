import { cn } from '@/lib/nativeWind';
import { Text as RNText, TextProps } from 'react-native';
type FontFamily = 'system' | 'teko' | 'teko-bold';
type AppTextProps = TextProps & {
  children: React.ReactNode;
  font?: FontFamily;
  className?: string;
};
const fontClasses: Record<FontFamily, string> = {
  system: '',
  teko: 'font-teko',
  'teko-bold': 'font-teko-bold',
};
export const Text = ({ children, font = 'system', className, style, ...rest }: AppTextProps) => {
  return (
    <RNText {...rest} className={cn('text-text text-left', fontClasses[font], className)} style={style}>
      {children}
    </RNText>
  );
};
