import { cn } from '@/lib/nativewind/nativeWind';
import { useIsRTL } from '@/providers/LanguageProvider';
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

export type RowProps = ViewProps & {
  between?: boolean;
  className?: string;
};

export const Row = forwardRef<View, RowProps>(function Row({ between = false, className, ...props }, ref) {
  const isRTL = useIsRTL();

  return (
    <View
      ref={ref}
      {...props}
      style={[
        props.style,
        { direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
      className={cn('flex-row items-center', between && 'justify-between', className)}
    />
  );
});
