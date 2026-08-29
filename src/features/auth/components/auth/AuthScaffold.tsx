import { images } from '@/assets/images';
import { AdaptiveCenter, Screen } from '@/components';
import { container } from '@/lib/nativewind/layout';
import { cn } from '@/lib/nativewind/nativeWind';
import { isWeb } from '@/lib/platform';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Header } from '../Header';

type AuthScaffoldProps = {
  title: string;
  description?: string;
  fallbackHref?: string;
  children: ReactNode;
  footer?: ReactNode;
  emblem?: ReactNode;
  showBack?: boolean;
  card?: boolean;
};

export default function AuthScaffold({
  fallbackHref = '/(auth)',
  children,
  footer,
  emblem,
  showBack = true,
  card = true,
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

      <Screen width="full" padding="horizontal" edges={['top']} className="bg-transparent">
        <KeyboardAwareScrollView
          bottomOffset={72}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header fallbackHref={fallbackHref} showBack={showInlineBack} />
          <AdaptiveCenter className={cn(container.form, 'gap-6 px-2')}>
            {emblem && <View className=" items-center">{emblem}</View>}

            <View>
              {children}
              {footer ? <View className="mt-6">{footer}</View> : null}
            </View>
          </AdaptiveCenter>
        </KeyboardAwareScrollView>
      </Screen>
    </View>
  );
}
