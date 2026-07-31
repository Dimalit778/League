import { cn } from '@/lib/nativewind/nativeWind';
import { View, type ViewProps } from 'react-native';

export type DividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export function Divider({ orientation = 'horizontal', className, ...props }: DividerProps) {
  return (
    <View
      {...props}
      accessibilityRole="none"
      className={cn('bg-border opacity-70', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    />
  );
}
