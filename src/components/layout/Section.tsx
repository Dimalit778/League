import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import { type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

export type SectionProps = ViewProps & {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  title,
  description,
  actionLabel,
  onActionPress,
  children,
  className,
  contentClassName,
  ...props
}: SectionProps) {
  const isRTL = useIsRTL();
  const hasHeader = title || description || (actionLabel && onActionPress);

  return (
    <View {...props} className={cn(spacing.list, className)}>
      {hasHeader ? (
        <View className={cn('flex-row items-start justify-between', spacing.list, isRTL && 'flex-row-reverse')}>
          <View className="min-w-0 flex-1 gap-1">
            {title ? <Text variant="subtitle">{title}</Text> : null}
            {description ? (
              <Text variant="bodySmall" tone="muted">
                {description}
              </Text>
            ) : null}
          </View>
          {actionLabel && onActionPress ? (
            <Pressable
              onPress={onActionPress}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              hitSlop={8}
              className="min-h-11 justify-center active:opacity-70"
            >
              <Text variant="label" tone="success">
                {actionLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View className={contentClassName}>{children}</View>
    </View>
  );
}
