import { Button } from '@/components/ui';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const { session } = useCurrentSession();

  if (session?.user) {
    return <Redirect href="/(app)/(public)/myLeagues" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background justify-center">
      <View className="justify-center items-center ">
        <Text 
          className="text-5xl text-secondary font-headBold pt-3"
          accessible={true}
          accessibilityRole="header"
        >
          Welcome to League
        </Text>

        <Text 
          className="text-base text-muted text-center mt-2"
          accessible={true}
          accessibilityRole="text"
        >
          Your ultimate football companion. Track leagues, follow matches, and
          stay connected with the beautiful game.
        </Text>
      </View>

      {/* Features Section */}
      <View className="gap-5 my-5">
        <View className="items-center">
          <Text className="text-2xl font-bold mb-4">🏆</Text>
          <Text className="text-3xl font-headBold text-text">
            Live Standings
          </Text>
          <Text className="text-muted text-base text-center px-5">
            Real-time league tables and team rankings
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl  mb-4">⚽</Text>
          <Text className="text-3xl text-text font-headBold">
            Match Updates
          </Text>
          <Text className="text-muted text-base mb-4 text-center px-5">
            Live scores and match notifications
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl ">📊</Text>
          <Text className="text-3xl text-text font-headBold">Statistics</Text>
          <Text className="text-muted text-base mb-4 text-center px-5">
            Detailed player and team analytics
          </Text>
        </View>
      </View>
      <View className="mt-10 px-5">
        <Button
          title="Get Started"
          onPress={() => router.push('/(auth)/signIn')}
          variant="secondary"
          size="lg"
          accessibilityLabel="Get started with League app"
          accessibilityHint="Double tap to sign in or create an account"
        />
      </View>
    </SafeAreaView>
  );
}
