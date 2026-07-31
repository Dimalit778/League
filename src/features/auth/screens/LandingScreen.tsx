import { images } from '@/assets/images';
import { Screen, Text } from '@/components/ui';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { ImageBackground } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function LandingScreen() {
  return (
    <>
      <ImageBackground
        source={images.bgWelcome}
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        contentFit="cover"
      />
      <Screen
        width="compact"
        padding="horizontal"
        edges={['top', 'bottom']}
        className="bg-transparent"
        contentClassName="bg-transparent"
      >
        <View className="flex-1 justify-center py-8 sm:py-12">
          <View className="items-center justify-center pb-8">
            <Text variant="display" tone="primary">
              League
            </Text>

            <View className="mt-2 rounded-2xl border border-primary px-7 py-2">
              <Text variant="display" tone="primary">
                Champion
              </Text>
            </View>

            <View className="mt-3 items-center">
              <Text variant="bodySmall" tone="muted" className="uppercase">
                Football Prediction
              </Text>
              <Text variant="subtitle" className="w-full pt-12 text-center sm:pt-16">
                Predict. Compete. Win.
              </Text>
            </View>
          </View>

          <View className={cn('mt-auto', spacing.stack)}>
            <Link href="/(auth)/signIn" asChild>
              <Pressable className="min-h-11 items-center justify-center rounded-xl bg-primary px-4 active:opacity-85">
                <Text variant="label" tone="inverse" className="text-center">
                  Get Started
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </Screen>
    </>
  );
}
