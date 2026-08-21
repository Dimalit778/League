import type { LucideIcon } from 'lucide-react-native';
import { View, type ViewProps } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';

type EmptyStateSize = 'sm' | 'md' | 'lg';

const FULL_SCREEN_OFFSET_Y = -160;

type EmptyStateProps = ViewProps & {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** @deprecated Use onAction */
  onActionPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  size?: EmptyStateSize;
  fill?: boolean;
  offsetY?: number;
  className?: string;
};

const SIZE_PRESETS: Record<
  EmptyStateSize,
  { iconSize: number; iconContainerSize: number; titleVariant: 'subtitle' | 'title' }
> = {
  sm: { iconSize: 26, iconContainerSize: 56, titleVariant: 'subtitle' },
  md: { iconSize: 36, iconContainerSize: 88, titleVariant: 'title' },
  lg: { iconSize: 44, iconContainerSize: 104, titleVariant: 'title' },
};

export function EmptyState({
  icon: Icon,
  size = 'md',
  fill,
  title,
  description,
  actionLabel,
  onAction,
  onActionPress,
  secondaryActionLabel,
  onSecondaryAction,
  offsetY,
  className,
  style,
  ...props
}: EmptyStateProps) {
  const { colors } = useThemeTokens();
  const preset = SIZE_PRESETS[size];
  const handleAction = onAction ?? onActionPress;
  const shouldFill = fill ?? size !== 'sm';
  const resolvedOffsetY = offsetY ?? (shouldFill ? FULL_SCREEN_OFFSET_Y : 0);
  const hasActions = (actionLabel && handleAction) || (secondaryActionLabel && onSecondaryAction);

  return (
    <View
      {...props}
      className={cn('w-full items-center justify-center px-4 py-2', shouldFill && 'flex-1 self-center px-6', className)}
      style={[style, resolvedOffsetY ? { transform: [{ translateY: resolvedOffsetY }] } : undefined]}
    >
      {Icon ? (
        <View
          className={cn('items-center justify-center rounded-full border', size === 'sm' ? 'mb-3' : 'mb-5')}
          style={{
            width: preset.iconContainerSize,
            height: preset.iconContainerSize,
            borderColor: setColorAlpha(colors.primary, 0.18),
            backgroundColor: setColorAlpha(colors.primary, 0.08),
          }}
        >
          <Icon size={preset.iconSize} color={colors.primary} strokeWidth={1.7} />
        </View>
      ) : null}

      <Text variant={preset.titleVariant} className="text-center">
        {title}
      </Text>

      {description ? (
        <Text variant="bodySmall" tone="muted" className="mt-1.5 max-w-[280px] text-center">
          {description}
        </Text>
      ) : null}

      {hasActions ? (
        <View className="mt-4 w-full max-w-[280px] gap-3">
          {actionLabel && handleAction ? <Button label={actionLabel} onPress={handleAction} fullWidth /> : null}

          {secondaryActionLabel && onSecondaryAction ? (
            <Button label={secondaryActionLabel} variant="outline" onPress={onSecondaryAction} fullWidth />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
