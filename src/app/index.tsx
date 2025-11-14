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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        {/* Header Section */}
        <View className="text-center mb-12">
          <Text
            className="text-5xl text-center text-secondary font-header leading-snug"
            accessible={true}
            accessibilityRole="header"
          >
            League Champion
          </Text>
        </View>

        <View className="gap-8">
          <View className="items-center">
            <Text className="text-4xl mb-3">🏆</Text>
            <Text className="text-2xl font-nunito-bold text-text mb-2">Live Standings</Text>
            <Text className="text-muted text-base text-center px-5">Real-time league tables and team rankings</Text>
          </View>

          <View className="items-center">
            <Text className="text-4xl mb-3">⚽</Text>
            <Text className="text-2xl text-text font-nunito-bold mb-2">Match Updates</Text>
            <Text className="text-muted text-base text-center px-5">Live scores and match notifications</Text>
          </View>

          <View className="items-center">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-2xl text-text font-nunito-bold mb-2">Statistics</Text>
            <Text className="text-muted text-base text-center px-5">Detailed player and team analytics</Text>
          </View>
        </View>
      </View>

      <View className="px-5 pb-5">
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
