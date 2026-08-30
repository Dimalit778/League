import type { LucideIcon } from 'lucide-react-native';
import { View, type ViewProps } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';

type EmptyStateSize = 'sm' | 'md' | 'lg';

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
  className?: string;
};

const SIZE_PRESETS: Record<
  EmptyStateSize,
  { iconSize: number; iconContainerSize: number; titleSize: 'lg' | 'xl' }
> = {
  sm: { iconSize: 26, iconContainerSize: 50, titleSize: 'lg' },
  md: { iconSize: 36, iconContainerSize: 88, titleSize: 'xl' },
  lg: { iconSize: 44, iconContainerSize: 104, titleSize: 'xl' },
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
  className,
  style,
  ...props
}: EmptyStateProps) {
  const { colors } = useThemeTokens();
  const preset = SIZE_PRESETS[size];
  const handleAction = onAction ?? onActionPress;
  const shouldFill = fill ?? size !== 'sm';
  const hasActions = (actionLabel && handleAction) || (secondaryActionLabel && onSecondaryAction);

  return (
    <View
      {...props}
      className={cn('w-full  items-center justify-center', shouldFill && 'flex-1 self-center px-6', className)}
      style={style}
    >
      {Icon ? (
        <View
          className={cn('items-center justify-center rounded-full border', size === 'sm' ? 'mb-1.5' : 'mb-4')}
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

      <Text variant="title" size={preset.titleSize} className="text-center">
        {title}
      </Text>

      {description ? (
        <Text variant="body" tone="muted" className="mt-1.5 max-w-[280px] text-center">
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
