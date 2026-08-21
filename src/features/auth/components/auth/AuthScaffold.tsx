import { images } from '@/assets/images';
import { Screen, Text } from '@/components';
import { ImageBackground } from 'expo-image';
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
  title,
  description,
  fallbackHref = '/(auth)',
  children,
  footer,
  emblem,
  showBack = true,
  card = true,
}: AuthScaffoldProps) {
  return (
    <View className="flex-1 bg-[#020A16]">
      <ImageBackground
        source={images.bgBallTrophy}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />

      <Screen width="full" padding="horizontal" edges={['top']} className="bg-transparent">
        <KeyboardAwareScrollView
          bottomOffset={72}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="mx-auto w-full max-w-[520px] flex-1">
            <Header fallbackHref={fallbackHref} showBack={showBack} />

            <View className="mt-12 gap-6 px-2">
              {emblem ? <View className=" items-center">{emblem}</View> : null}

              <View className="items-center">
                <Text accessibilityRole="header" variant="display" className="text-white">
                  {title}
                </Text>
                {description ? (
                  <Text className="mt-2 max-w-[420px] text-center text-white/70">{description}</Text>
                ) : null}
              </View>

              <View className="bg-black/20 border border-border rounded-2xl px-6 py-8 gap-4">{children}</View>

              {footer ? <View>{footer}</View> : null}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Screen>
    </View>
  );
}
