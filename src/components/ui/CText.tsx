import { cn } from '@/lib/nativeWind';
import { Text, TextProps } from 'react-native';

type Props = TextProps & { children: React.ReactNode };

export const CText = ({ children, className, style, ...rest }: Props) => {
  return (
    <Text {...rest} className={cn('text-text text-left', className)}>
      {children}
    </Text>
  );
};
