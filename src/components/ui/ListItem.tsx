import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';
import { Divider } from './Divider';
import { Text, type TextTone } from './Text';

export type ListItemProps = Omit<PressableProps, 'children'> & {
  icon?: LucideIcon;
  title: string;
  titleTone?: TextTone;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  right?: 'chevron' | 'none';
  badge?: ReactNode;
  divider?: boolean;
  className?: string;
};

function asNode(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <View className="min-w-0 max-w-40 shrink">
        <Text variant="bodySmall" tone="muted" numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
      </View>
    );
  }
  return value;
}

export function ListItem({
  icon: Icon,
  title,
  titleTone,
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
  const leadingContent = leading ?? (Icon ? <Icon size={20} color={colors.muted} strokeWidth={2} /> : null);
  const trailingContent = (
    <View className={cn('min-w-0 shrink flex-row items-center', spacing.inline)} style={{ direction: 'ltr' }}>
      {asNode(badge)}
      {asNode(trailing)}
      {right === 'chevron' ? <Chevron size={18} color={colors.muted} strokeWidth={2} /> : null}
    </View>
  );
  const content = (
    <>
      <View className={cn('min-h-14 flex-row items-center py-2', spacing.list)} style={{ direction: 'ltr' }}>
        {isRTL ? trailingContent : leadingContent}
        <View className="min-w-0 flex-1">
          <Text variant="body" tone={titleTone} numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodySmall" tone="muted">
              {description}
            </Text>
          ) : null}
        </View>
        {isRTL ? leadingContent : trailingContent}
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
