import { cn } from '@/lib/nativewind/nativeWind';
import { forwardRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

export type CardVariant = 'default' | 'soft' | 'outlined' | 'elevated' | 'interactive' | 'hero' | 'secondary';
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
  default: 'bg-surface',
  soft: 'bg-surfaceSoft',
  outlined: 'border border-border bg-surface',
  elevated: 'border border-border/50 bg-surfaceElevated shadow-sm elevation-1',
  interactive: 'bg-surface',
  hero: 'border border-border/50 bg-surfaceElevated rounded-3xl shadow-md elevation-3',
  secondary: 'bg-surfaceSoft',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<View, CardProps>(function Card(
  {
    children,
    className,
    contentClassName,
    variant = 'default',
    padding = 'md',
    style,
    onPress,
    ...props
  },
  ref,
) {
  const cardClassName = cn('rounded-2xl', variantClasses[variant], className);
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
