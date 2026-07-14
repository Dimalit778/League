import { cn } from '@/lib/nativeWind';
import { Pressable, PressableProps, StyleProp, View, ViewProps, ViewStyle } from 'react-native';

type CardVariant = 'default' | 'secondary' | 'outlined';
type CardPadding = 'sm' | 'md' | 'lg';

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

type CardProps = StaticCardProps | PressableCardProps;

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-border bg-surface',
  secondary: 'border border-border bg-surfaceSecondary',
  outlined: 'border border-border bg-transparent',
};

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
};

export function Card({
  children,
  className,
  contentClassName,

  variant = 'default',
  padding = 'sm',
  style,
  onPress,
  ...props
}: CardProps) {
  const cardClassName = cn('overflow-hidden rounded-2xl', variantClasses[variant], className);

  const content = <View className={cn(paddingClasses[padding], contentClassName)}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        {...(props as PressableProps)}
        onPress={onPress}
        className={cn(cardClassName, 'active:opacity-90')}
        style={style}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View {...(props as ViewProps)} className={cardClassName} style={style}>
      {content}
    </View>
  );
}
