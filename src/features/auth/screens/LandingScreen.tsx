import { images } from '@/assets/images';
import { Text } from '@/components/ui';

import { Link } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
export default function LandingScreen() {
  return (
    <>
      <Image source={images.bgWelcome} className="absolute w-full h-full" />
      <View className="flex-1  pt-24">
        <View className="items-center pb-8">
          <Text font="teko-bold" className="text-[50px] text-primary">
            League
          </Text>

          <View className="mt-2 rounded-2xl border border-primary px-7 py-2">
            <Text font="teko-bold" className="text-[48px] text-primary">
              Champion
            </Text>
          </View>

          <View className="mt-3 rounded-full  ">
            <Text caption className="text-muted uppercase">
              Football Prediction
            </Text>
          </View>
        </View>

        <Text h2 semibold className="pt-16 text-center text-white/80">
          Predict. Compete. Win.
        </Text>
      </View>

      <View className="px-5 pb-8 mt-auto">
        <Link href="/(auth)/signIn" asChild>
          <Pressable className="mb-4 rounded-2xl bg-primary p-4 active:opacity-85">
            <Text semibold className="text-center">
              Get Started
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
