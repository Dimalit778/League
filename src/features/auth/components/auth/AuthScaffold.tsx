import { images } from '@/assets/images';
import { BackButton, Brand, Screen } from '@/components';
import { cn } from '@/lib/nativewind/nativeWind';
import { isWeb } from '@/lib/platform';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
type HeaderProps = {
  fallbackHref?: string;
  showBack?: boolean;
};

type AuthScaffoldProps = {
  fallbackHref?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showBack?: boolean;
};
export function Header({ fallbackHref, showBack = true }: HeaderProps) {
  const showBackButton = showBack && !isWeb;

  return (
    <View className="h-12 w-full justify-center bg-transparent">
      {showBackButton ? (
        <View className="absolute start-0 z-10">
          <BackButton fallbackHref={fallbackHref} variant="onImage" />
        </View>
      ) : null}
      <View className="items-center px-14" pointerEvents="none">
        <Brand size="sm" onBoarding />
      </View>
    </View>
  );
}
export default function AuthScaffold({
  fallbackHref = '/(auth)',
  children,
  footer,
  className,
  showBack = true,
}: AuthScaffoldProps) {
  const showInlineBack = showBack && !isWeb;

  return (
    <View className="flex-1 bg-[#020A16]">
      <ImageBackground
        source={images.wallpaperBall}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(2,10,22,0.82)', 'rgba(2,10,22,0.42)', 'rgba(2,10,22,0.78)']}
        locations={[0, 0.9, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Screen width="full" padding="horizontal" edges={['top', 'bottom']} className="bg-transparent">
        <KeyboardAwareScrollView
          className="flex-1"
          bottomOffset={72}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header fallbackHref={fallbackHref} showBack={showInlineBack} />
          <View className={cn('mx-auto w-full max-w-[520px]', className)}>
            {children}
            {footer}
          </View>
        </KeyboardAwareScrollView>
      </Screen>
    </View>
  );
}
