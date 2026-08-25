import { cn } from '@/lib/nativewind/nativeWind';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';

export type CardVariant = 'surface' | 'soft' | 'elevated' | 'hero' | 'outline';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type BaseCardProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
};

type StaticCardProps = BaseCardProps &
  Omit<ViewProps, 'children' | 'className' | 'style'> & {
    onPress?: never;
  };

type PressableCardProps = BaseCardProps &
  Omit<PressableProps, 'children' | 'className' | 'style' | 'onPress'> & {
    onPress: NonNullable<PressableProps['onPress']>;
  };

export type CardProps = StaticCardProps | PressableCardProps;

const variantClasses: Record<CardVariant, string> = {
  surface: 'bg-surface',
  soft: 'bg-surface',
  outline: 'border border-border bg-transparent',
  elevated: 'border-none bg-surface shadow-sm elevation-3',
  hero: 'border border-primary bg-surface rounded-3xl shadow-md elevation-3',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<View, CardProps>(function Card(
  { children, className, contentClassName, variant = 'surface', padding = 'md', style, onPress, ...props },
  ref,
) {
  const cardClassName = cn('rounded-2xl border border-border', variantClasses[variant], className);
  const content = <View className={cn(paddingClasses[padding], contentClassName)}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        {...(props as PressableProps)}
        onPress={onPress}
        accessibilityRole="button"
        className={cn(cardClassName, 'active:opacity-90')}
        style={style}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View ref={ref} {...(props as ViewProps)} className={cardClassName} style={style}>
      {content}
    </View>
  );
});
