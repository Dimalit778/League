import { CText, ScreenBackground } from '@/components/ui';
import trophyBallBg from '@assets/images/trophy-ball.png';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function LandingScreen() {
  return (
    <ScreenBackground source={trophyBallBg}>
      <View className="flex-1  pt-16">
        <View className="items-center pb-8">
          <CText className="text-text text-[50px] font-bold leading-[54px] tracking-tight">League</CText>

          <View className="mt-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-2">
            <CText className="text-text text-[48px] font-bold leading-[52px] tracking-tight">Champion</CText>
          </View>

          <View className="mt-3 rounded-full  px-4 py-1">
            <CText className="text-primary text-xs font-semibold uppercase tracking-[3px]">Football Prediction</CText>
          </View>
        </View>

        <CText className="pt-16 text-center text-2xl font-semibold text-white/80">Predict. Compete. Win.</CText>
      </View>

      <View className="px-5 pb-8">
        <Link href="/(auth)/signIn" asChild>
          <Pressable className="mb-4 rounded-2xl bg-primary p-4 active:opacity-85">
            <CText className="text-background text-center text-xl font-semibold">Get Started</CText>
          </Pressable>
        </Link>
      </View>
    </ScreenBackground>
  );
}
