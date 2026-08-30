import { Text } from '@/components';
import { AdminPageHeader, AdminSearchField } from '@/features/admin/components/AdminUI';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';

export const ADMIN_WEB_CONTENT_CLASS = 'mx-auto w-full max-w-[1440px] px-6 py-7 xl:px-10 xl:py-9';

type AdminWebPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  trailing?: ReactNode;
};

export function AdminWebPageHeader(props: AdminWebPageHeaderProps) {
  return <AdminPageHeader {...props} />;
}

type AdminWebToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  summary: string;
  trailing?: ReactNode;
};

export function AdminWebToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  summary,
  trailing,
}: AdminWebToolbarProps) {
  return (
    <View className="mb-4 flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-3">
      <View className="max-w-xl flex-1">
        <AdminSearchField value={searchValue} onChangeText={onSearchChange} placeholder={searchPlaceholder} />
      </View>
      <Text variant="body" size="sm" tone="muted" className="ml-auto">
        {summary}
      </Text>
      {trailing}
    </View>
  );
}

export type AdminWebColumn = {
  label: string;
  flex?: number;
  width?: number;
  minWidth?: number;
};

export function AdminWebTable({
  columns,
  children,
  minWidth = 960,
}: {
  columns: AdminWebColumn[];
  children: ReactNode;
  minWidth?: number;
}) {
  const { isRTL } = useTranslation();
  const direction: ViewStyle = { flexDirection: isRTL ? 'row-reverse' : 'row' };

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-surface">
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ minWidth, flex: 1 }}>
          <View className="min-h-12 items-center border-b border-border bg-subtle px-4" style={direction}>
            {columns.map((column) => (
              <View
                key={column.label}
                className="justify-center px-3"
                style={{ flex: column.flex, width: column.width, minWidth: column.minWidth }}
              >
                <Text variant="caption" tone="muted" className="font-bold uppercase tracking-[0.7px]">
                  {column.label}
                </Text>
              </View>
            ))}
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function AdminWebTableRow({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { isRTL } = useTranslation();
  const className = 'min-h-[68px] items-center border-b border-border px-4 last:border-b-0';
  const style: ViewStyle = { flexDirection: isRTL ? 'row-reverse' : 'row' };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className={cn(className, 'hover:bg-subtle active:opacity-80')}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={style}>
      {children}
    </View>
  );
}

export function AdminWebCell({
  children,
  flex,
  width,
  minWidth,
  className,
}: {
  children: ReactNode;
  flex?: number;
  width?: number;
  minWidth?: number;
  className?: string;
}) {
  return (
    <View className={cn('min-w-0 justify-center px-3', className)} style={{ flex, width, minWidth }}>
      {children}
    </View>
  );
}

export function AdminWebIdentity({ title, subtitle, initials }: { title: string; subtitle?: string | null; initials: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Text variant="caption" tone="primary" className="font-bold">
          {initials || '?'}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text variant="body" size="sm" className="font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" ltr numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
