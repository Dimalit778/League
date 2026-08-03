import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import { type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

export type SectionProps = ViewProps & {
  title?: string;
  description?: string;
  /** Text shown on the trailing side (requires `onActionPress`) */
  actionLabel?: string;
  /** Icon / node shown on the trailing side (requires `onActionPress`) */
  actionIcon?: ReactNode;
  onActionPress?: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  title,
  description,
  actionLabel,
  actionIcon,
  onActionPress,
  children,
  className,
  contentClassName,
  ...props
}: SectionProps) {
  const isRTL = useIsRTL();
  const hasAction = Boolean(onActionPress && (actionLabel || actionIcon));
  const hasHeader = Boolean(title || description || hasAction);
  const headerText = (
    <View className="min-w-0 flex-1 gap-1" style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
      {title ? (
        <Text variant="subtitle" className="w-full" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text variant="bodySmall" tone="muted" className="w-full" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {description}
        </Text>
      ) : null}
    </View>
  );
  const headerAction = hasAction ? (
    <Pressable
      onPress={onActionPress}
      accessibilityRole="button"
      accessibilityLabel={actionLabel ?? title}
      hitSlop={8}
      className={cn('min-h-9 flex-row items-center active:opacity-70', spacing.inline)}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {actionLabel ? (
        <Text variant="label" tone="success">
          {actionLabel}
        </Text>
      ) : null}
      {actionIcon}
    </Pressable>
  ) : null;

  return (
    <View
      {...props}
      style={[props.style, { direction: isRTL ? 'rtl' : 'ltr' }]}
      className={cn(spacing.list, className)}
    >
      {hasHeader ? (
        <View className={cn('flex-row items-center justify-between', spacing.list)} style={{ direction: 'ltr' }}>
          {isRTL ? headerAction : headerText}
          {isRTL ? headerText : headerAction}
        </View>
      ) : null}
      <View className={contentClassName} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        {children}
      </View>
    </View>
  );
}
