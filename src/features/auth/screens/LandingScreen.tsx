import { ScreenBackground, Text } from '@/components/ui';
import trophyBallBg from '@assets/images/trophy-ball.png';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function LandingScreen() {
  return (
    <ScreenBackground source={trophyBallBg}>
      <View className="flex-1  pt-16">
        <View className="items-center pb-8">
          <Text font="teko-bold" className="text-[50px]">
            League
          </Text>

          <View className="mt-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-2">
            <Text font="teko-bold" className="text-[48px]">
              Champion
            </Text>
          </View>

          <View className="mt-3 rounded-full  ">
            <Text caption className="text-primary uppercase">
              Football Prediction
            </Text>
          </View>
        </View>

        <Text h2 semibold className="pt-16 text-center text-white/80">
          Predict. Compete. Win.
        </Text>
      </View>

      <View className="px-5 pb-8">
        <Link href="/(auth)/signIn" asChild>
          <Pressable className="mb-4 rounded-2xl bg-primary p-4 active:opacity-85">
            <Text semibold className="text-center">
              Get Started
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScreenBackground>
  );
}
