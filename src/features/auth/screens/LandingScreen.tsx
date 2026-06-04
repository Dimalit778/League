import { CText } from '@/components/ui';
import { ImageBackground, Pressable, Text, View } from 'react-native';

import footballBg from '@assets/images/football-bg.png';
import { Link } from 'expo-router';
export default function LandingScreen() {
  return (
    <View className="flex-1">
      <ImageBackground
        className="opacity-60"
        resizeMode={'cover'}
        source={footballBg}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <View className="flex-1 justify-center mt-10">
        <Text className="text-center text-black text-7xl font-black leading-tight">League</Text>
        <Text className="text-center  text-black text-7xl font-black leading-tight">Champion</Text>
        <CText variant="body" className="text-center text-stone-800">
          Predict. Compete. Win.
        </CText>
      </View>

      <View className="flex-1 justify-end px-5 pb-16">
        <Link href="/(auth)/signIn" asChild>
          <Pressable className="bg-blue-500/80 p-4 rounded-full">
            <CText className="text-white text-center text-2xl font-bold">Get Started</CText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
