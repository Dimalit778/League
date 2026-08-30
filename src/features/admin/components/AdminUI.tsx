import { Badge, Card, EmptyState, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn } from '@/lib/nativewind/nativeWind';
import type { LucideIcon } from 'lucide-react-native';
import { Search, ShieldAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { TextInput, View, type ViewProps } from 'react-native';

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  trailing?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, trailing }: AdminPageHeaderProps) {
  return (
    <View className="mb-5 gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
      <View className="min-w-0 flex-1">
        {eyebrow ? (
          <Text variant="caption" tone="primary" className="mb-1 font-bold uppercase tracking-[1.4px]">
            {eyebrow}
          </Text>
        ) : null}
        <Text accessibilityRole="header" variant="heading" size="5xl" className="text-[28px] leading-9 md:text-[34px] md:leading-10">
          {title}
        </Text>
        <Text variant="body" size="sm" tone="muted" className="mt-1 max-w-[680px]">
          {description}
        </Text>
      </View>
      {trailing ? <View className="self-start md:self-auto">{trailing}</View> : null}
    </View>
  );
}

type AdminSearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function AdminSearchField({ value, onChangeText, placeholder }: AdminSearchFieldProps) {
  const { colors } = useThemeTokens();

  return (
    <View className="min-h-[48px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4">
      <Search size={19} color={colors.muted} strokeWidth={1.9} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        className="min-h-[48px] min-w-0 flex-1 text-base text-text"
      />
    </View>
  );
}

export function AdminCollectionSummary({ countLabel, badgeLabel }: { countLabel: string; badgeLabel?: string }) {
  return (
    <View className="mb-3 flex-row flex-wrap items-center justify-between gap-2">
      <Text variant="body" size="sm" tone="muted">
        {countLabel}
      </Text>
      {badgeLabel ? <Badge label={badgeLabel} variant="info" /> : null}
    </View>
  );
}

export function AdminErrorBanner({ message }: { message: string }) {
  const { colors } = useThemeTokens();

  return (
    <View className="mb-4 flex-row items-start gap-3 rounded-2xl border border-error/30 bg-error/10 p-4">
      <ShieldAlert size={20} color={colors.error} />
      <Text variant="body" size="sm" tone="error" className="min-w-0 flex-1">
        {message}
      </Text>
    </View>
  );
}

type AdminMetricCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  emphasis?: 'default' | 'warning';
};

export function AdminMetricCard({ label, value, icon: Icon, emphasis = 'default' }: AdminMetricCardProps) {
  const { colors } = useThemeTokens();
  const highlighted = emphasis === 'warning' && value > 0;

  return (
    <Card
      variant="soft"
      padding="sm"
      className={cn('min-h-[116px]', highlighted && 'border-warning/50 bg-warning/10')}
      contentClassName="gap-3"
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className={cn('h-9 w-9 items-center justify-center rounded-xl bg-background', highlighted && 'bg-warning/10')}>
          <Icon size={19} color={highlighted ? colors.warning : colors.primary} strokeWidth={1.9} />
        </View>
        {highlighted ? <Badge label={String(value)} variant="warning" /> : null}
      </View>
      <View>
        <Text variant="title" className="text-[25px] leading-7">
          {value.toLocaleString()}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Card>
  );
}

export function AdminMeta({ label, value, ltr, className }: { label: string; value?: ReactNode; ltr?: boolean; className?: string }) {
  return (
    <View className={cn('min-w-0 gap-0.5', className)}>
      <Text variant="caption" tone="muted" className="font-semibold uppercase tracking-[0.8px]">
        {label}
      </Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text variant="body" size="sm" ltr={ltr} numberOfLines={2}>
          {String(value)}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export function AdminCardGrid({ children, className, ...props }: ViewProps & { children: ReactNode }) {
  return (
    <View {...props} className={cn('-mx-1.5 flex-row flex-wrap', className)}>
      {children}
    </View>
  );
}

export function AdminGridItem({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('w-full p-1.5 md:w-1/2', className)}>{children}</View>;
}

export function AdminEmpty({ title, description, icon }: { title: string; description?: string; icon?: LucideIcon }) {
  return <EmptyState size="sm" icon={icon} title={title} description={description} className="py-10" />;
}
