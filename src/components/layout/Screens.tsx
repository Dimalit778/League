import { layout, type ScreenWidth, screenWidths } from '@/lib/nativewind/layout';
import { cn } from '@/lib/nativewind/nativeWind';
import { useIsRTL } from '@/providers/LanguageProvider';
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
  const isRTL = useIsRTL();
  const usesSafeArea = safeArea ?? edges !== undefined;
  const Root = usesSafeArea ? SafeAreaView : View;
  const rootClassName = cn('flex-1 bg-background', className);
  const containerClass = cn('mx-auto w-full', screenWidths[width], paddingClasses[padding]);
  const paddingBottom = bottomInset === true ? insets.bottom : typeof bottomInset === 'number' ? bottomInset : 0;
  const bottomInsetStyle = paddingBottom > 0 ? { paddingBottom } : undefined;
  const directionStyle = { direction: isRTL ? ('rtl' as const) : ('ltr' as const) };

  const centeringStyle = { direction: 'ltr' as const };

  if (scroll) {
    return (
      <Root {...(usesSafeArea && edges ? { edges } : {})} className={rootClassName}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={containerClass}
          contentContainerStyle={[centeringStyle, bottomInsetStyle, contentContainerStyle]}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          <View className={cn('min-h-0 w-full flex-grow', contentClassName)} style={directionStyle}>
            {children}
          </View>
        </ScrollView>
      </Root>
    );
  }

  return (
    <Root {...(usesSafeArea && edges ? { edges } : {})} className={rootClassName}>
      <View className={cn('min-h-0 flex-1', containerClass)} style={[centeringStyle, bottomInsetStyle]}>
        <View className={cn('min-h-0 w-full flex-1', contentClassName)} style={directionStyle}>
          {children}
        </View>
      </View>
    </Root>
  );
}
