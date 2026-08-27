import { useThemeTokens } from '@/hooks/useThemeTokens';
import type { IconProps } from '@/types';
import { useRouter, type Href } from 'expo-router';
import { type ComponentType, type ReactNode } from 'react';
import { Pressable } from 'react-native';

const SIZE = 40;
const ICON_SIZE = 24;

type TabIcon = ComponentType<IconProps & { strokeWidth?: number }>;

export function TabButton({
  href,
  icon: Icon,
  accessibilityLabel,
  children,
}: {
  href: Href;
  icon?: TabIcon;
  accessibilityLabel?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const { colors } = useThemeTokens();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className="z-10 items-center justify-center rounded-full border border-border bg-subtle"
      style={{ width: SIZE, height: SIZE }}
      onPress={() => router.push(href)}
    >
      {Icon ? <Icon size={ICON_SIZE} color={colors.text} strokeWidth={2} /> : children}
    </Pressable>
  );
}
