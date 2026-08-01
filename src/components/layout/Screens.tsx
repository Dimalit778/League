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
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

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
  bottomInset?: number;
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
  bottomInset = 0,
  showsVerticalScrollIndicator = false,
}: ScreenProps) {
  const usesSafeArea = safeArea ?? edges !== undefined;
  const Root = usesSafeArea ? SafeAreaView : View;
  const rootClassName = cn('flex-1 bg-background', className);
  const contentClass = cn('mx-auto w-full', screenWidths[width], paddingClasses[padding], contentClassName);

  if (scroll) {
    return (
      <Root {...(usesSafeArea && edges ? { edges } : {})} className={rootClassName}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClass}
          contentContainerStyle={[bottomInset > 0 ? { paddingBottom: bottomInset } : null, contentContainerStyle]}
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
      <View
        className={cn('flex-1 min-h-0', contentClass)}
        style={bottomInset > 0 ? { paddingBottom: bottomInset } : undefined}
      >
        {children}
      </View>
    </Root>
  );
}
