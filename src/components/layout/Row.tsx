import { cn } from '@/lib/nativewind/nativeWind';
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

export type RowProps = ViewProps & {
  between?: boolean;
  className?: string;
};

export const Row = forwardRef<View, RowProps>(function Row({ between = false, className, ...props }, ref) {
  return (
    <View
      ref={ref}
      {...props}
      className={cn('flex-row items-center', between && 'justify-between', className)}
    />
  );
});
