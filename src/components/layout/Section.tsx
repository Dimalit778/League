import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import { type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { Text } from '../ui/Text';
import { Row } from './Row';

export type SectionProps = ViewProps & {
  title?: string;
  description?: string;

  actionLabel?: string;

  actionIcon?: ReactNode;
  onActionPress?: () => void;

  accent?: boolean;
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
  accent = false,
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
        accent ? (
          <Row className="gap-2">
            <View className="h-4 w-1 rounded-full bg-primary" />
            <Text
              variant="title"
              size="lg"
              numberOfLines={1}
              accessibilityRole="header"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {title}
            </Text>
          </Row>
        ) : (
          <Text
            variant="title"
            size="lg"
            className="w-full"
            accessibilityRole="header"
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {title}
          </Text>
        )
      ) : null}
      {description ? (
        <Text variant="body" size="sm" tone="muted" className="w-full" style={{ textAlign: isRTL ? 'right' : 'left' }}>
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
      hitSlop={10}
      className={cn('min-h-6 flex-row items-center active:opacity-70 mx-2', spacing.inline)}
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
