import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';
import { Divider } from './Divider';
import { Text } from './Text';

export type ListItemProps = Omit<PressableProps, 'children'> & {
  icon?: LucideIcon;
  title: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  right?: 'chevron' | 'none';
  badge?: ReactNode;
  divider?: boolean;
  className?: string;
};

export function ListItem({
  icon: Icon,
  title,
  description,
  leading,
  trailing,
  right = 'none',
  badge,
  divider = false,
  onPress,
  disabled,
  className,
  ...props
}: ListItemProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const content = (
    <>
      <View className={cn('min-h-14 flex-row items-center py-2', spacing.list, isRTL && 'flex-row-reverse')}>
        {leading ?? (Icon ? <Icon size={20} color={colors.muted} strokeWidth={2} /> : null)}
        <View className="min-w-0 flex-1">
          <Text variant="body" numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodySmall" tone="muted" numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
        {badge}
        {trailing}
        {right === 'chevron' ? <Chevron size={18} color={colors.muted} strokeWidth={2} /> : null}
      </View>
      {divider ? <Divider /> : null}
    </>
  );

  if (!onPress) {
    return <View className={className}>{content}</View>;
  }

  return (
    <Pressable
      {...props}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{ disabled: Boolean(disabled) }}
      className={cn('active:opacity-75', disabled && 'opacity-50', className)}
    >
      {content}
    </Pressable>
  );
}
