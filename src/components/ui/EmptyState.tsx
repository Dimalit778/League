import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn } from '@/lib/nativewind/nativeWind';
import type { LucideIcon } from 'lucide-react-native';
import { AlertCircle, Lock, WifiOff } from 'lucide-react-native';
import { View, type ViewProps } from 'react-native';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { Text } from './Text';

export type EmptyStateVariant = 'empty' | 'error' | 'offline' | 'locked';

export type EmptyStateProps = ViewProps & {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  variant?: EmptyStateVariant;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  variant = 'empty',
  className,
  ...props
}: EmptyStateProps) {
  const { colors } = useThemeTokens();
  const fallbackIcons = { empty: AlertCircle, error: AlertCircle, offline: WifiOff, locked: Lock };
  const Icon = icon ?? fallbackIcons[variant];
  const iconColor = variant === 'error' ? colors.error : variant === 'offline' ? colors.warning : colors.muted;

  return (
    <GlassCard {...props} contentClassName={cn('items-center justify-center px-6 py-6', className)}>
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-subtle">
        <Icon size={32} color={iconColor} strokeWidth={2} />
      </View>
      <Text variant="subtitle" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" tone="muted" className="mt-1 text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onActionPress ? (
        <Button
          label={actionLabel}
          variant={variant === 'error' ? 'error' : 'outline'}
          onPress={onActionPress}
          className="mt-5"
        />
      ) : null}
    </GlassCard>
  );
}
