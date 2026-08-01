import { layout, type ScreenWidth, screenWidths } from '@/lib/nativewind/layout';
import { cn } from '@/lib/nativewind/nativeWind';
import { type ReactElement, type ReactNode } from 'react';
import {
  type RefreshControlProps,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { type Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  safeArea?: boolean;
  edges?: Edge[];
  padding?: 'none' | 'horizontal' | 'all';
  width?: ScreenWidth;
  contentClassName?: string;
  className?: string;
  refreshControl?: ReactElement<RefreshControlProps>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** `true` → safe-area bottom; number → explicit paddingBottom */
  bottomInset?: boolean | number;
  showsVerticalScrollIndicator?: boolean;
};

const paddingClasses: Record<NonNullable<ScreenProps['padding']>, string> = {
  none: '',
  horizontal: layout.screenPaddingHorizontal,
  all: layout.screenPaddingAll,
};

export function Screen({
  children,
  scroll = false,
  safeArea,
  edges,
  padding = 'none',
  width = 'content',
  contentClassName,
  className,
  refreshControl,
  keyboardShouldPersistTaps,
  contentContainerStyle,
  bottomInset,
  showsVerticalScrollIndicator = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const usesSafeArea = safeArea ?? edges !== undefined;
  const Root = usesSafeArea ? SafeAreaView : View;
  const rootClassName = cn('flex-1 bg-background', className);
  const contentClass = cn('mx-auto w-full', screenWidths[width], paddingClasses[padding], contentClassName);
  const paddingBottom = bottomInset === true ? insets.bottom : typeof bottomInset === 'number' ? bottomInset : 0;
  const bottomInsetStyle = paddingBottom > 0 ? { paddingBottom } : undefined;

  if (scroll) {
    return (
      <Root {...(usesSafeArea && edges ? { edges } : {})} className={rootClassName}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClass}
          contentContainerStyle={[bottomInsetStyle, contentContainerStyle]}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      </Root>
    );
  }

  return (
    <Root {...(usesSafeArea && edges ? { edges } : {})} className={rootClassName}>
      <View className={cn('flex-1 min-h-0', contentClass)} style={bottomInsetStyle}>
        {children}
      </View>
    </Root>
  );
}
