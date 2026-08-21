import { cn } from '@/lib/nativewind/nativeWind';
import { useIsRTL } from '@/providers/LanguageProvider';
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

export type RowProps = ViewProps & {
  between?: boolean;
  /**
   * Pin the row to visual left-to-right order regardless of language.
   * Use for content that must never mirror: scores (`2 - 1`), brand marks,
   * OTP inputs, logo/flag rows, progress segments.
   * Omit for normal content rows, which follow the reading direction.
   */
  keepLtr?: boolean;
  className?: string;
};

export const Row = forwardRef<View, RowProps>(function Row(
  { between = false, keepLtr = false, className, ...props },
  ref,
) {
  const isRTL = useIsRTL();
  const flexDirection = keepLtr ? 'row' : isRTL ? 'row-reverse' : 'row';

  return (
    <View
      ref={ref}
      {...props}
      style={[props.style, { direction: 'ltr', flexDirection }]}
      className={cn('flex-row items-center', between && 'justify-between', className)}
    />
  );
});
