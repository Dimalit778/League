import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/nativewind/nativeWind';
import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type AdaptiveCenterProps = ViewProps & {
  children: ReactNode;

  phoneClassName?: string;
  className?: string;
};

export function AdaptiveCenter({ children, phoneClassName = 'mt-12', className, ...props }: AdaptiveCenterProps) {
  const { isTabletDevice, isDesktop } = useBreakpoint();
  const roomy = isTabletDevice || isDesktop;

  return (
    <View {...props} className={cn(roomy ? 'flex-1 justify-center' : phoneClassName, className)}>
      {children}
    </View>
  );
}
