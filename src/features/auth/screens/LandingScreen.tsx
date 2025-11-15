import { ImageBackground, Pressable, Text, View } from 'react-native';

import footballBg from '@assets/images/football-bg.png';
import { Link } from 'expo-router';
export default function LandingScreen() {
  return (
    <View className="flex-1 ">
      <ImageBackground className="absolute  w-full h-full opacity-60" resizeMode={'cover'} source={footballBg} />

      <View className="flex-1 justify-center mt-10">
        <Text
          className="text-center text-black  font-nunito-bold"
          accessible={true}
          accessibilityRole="header"
          style={{ fontSize: 60 }}
        >
          League
        </Text>
        <Text className="text-center text-black   font-nunito-bold " style={{ fontSize: 56 }}>
          Champion
        </Text>
      </View>

      <View className="flex-1 justify-end px-5 pb-5">
        <Link href="/(auth)/signIn" asChild>
          <Pressable className="bg-blue-500/80 p-4 rounded-full">
            <Text className="text-white text-center text-2xl font-nunito-bold">Get Started</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
