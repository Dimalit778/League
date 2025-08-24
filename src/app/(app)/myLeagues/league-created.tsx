import { LoadingOverlay } from '@/components/layout';
import { Image } from '@/components/ui';
import { useGetFullLeagueAndMembersById } from '@/hooks/useLeagues';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueStore } from '@/store/LeagueStore';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Clipboard,
  SafeAreaView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LeagueCreatedScreen() {
  const { leagueId } = useLocalSearchParams();
  const { data: leagueData } = useGetFullLeagueAndMembersById(
    leagueId as string
  );
  const router = useRouter();
  const { user } = useAuthStore();
  const { initializeLeagues } = useLeagueStore();

  if (!leagueData) {
    return <LoadingOverlay />;
  }

  const handleCopyJoinCode = () => {
    if (typeof leagueData?.join_code === 'string') {
      Clipboard.setString(leagueData?.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  const handleShareJoinCode = async () => {
    try {
      const shareMessage = `🏆 Join my ${leagueData?.competitions?.name || 'Football'} league "${leagueData?.name}"!\n\nUse code: ${leagueData?.join_code}\n\nDownload the app to join!`;

      await Share.share({
        message: shareMessage,
        title: `Join ${leagueData?.name} League`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-10">
      {/* Success Header */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-center mb-2 text-text">
          League Created Successfully! 🎉
        </Text>
        <Text className="text-base text-textMuted text-center">
          Your {leagueData?.competitions?.name || 'Football'} league is ready
        </Text>
      </View>

      {/* League Info Card */}
      <View className="bg-card rounded-2xl p-6 mb-8 border border-border shadow-sm">
        {/* Centered League Header */}
        <View className="items-center mb-6">
          <Image
            source={{
              uri: leagueData?.competitions?.logo,
            }}
            className="rounded-2xl mb-4 shadow-sm"
            width={80}
            height={80}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-center text-text mb-2 mt-4">
            {leagueData?.name}
          </Text>
          <Text className="text-base text-textMuted text-center">
            {leagueData?.competitions?.country} •{' '}
            {leagueData?.competitions?.name}
          </Text>
        </View>

        <View className="bg-background/50 rounded-xl p-4 mb-4 border border-border/50">
          <Text className="text-sm font-medium text-textMuted mb-1 text-center">
            Your Nickname
          </Text>
          <Text className="text-lg font-bold text-text text-center">
            {leagueData?.league_members[0]?.nickname}
          </Text>
        </View>

        <View className="bg-background/50 rounded-xl p-4">
          <Text className="text-sm font-medium text-textMuted mb-3 text-center">
            League Join Code
          </Text>
          <TouchableOpacity
            onPress={handleCopyJoinCode}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-3"
          >
            <Text className="text-2xl font-mono font-bold text-primary text-center tracking-[8px]">
              {leagueData?.join_code}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-textMuted text-center">
            Tap to copy code
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={handleShareJoinCode}
          className="bg-primary rounded-xl p-4 flex-row items-center justify-center"
        >
          <Feather name="share" size={20} color="#374151" />
          <Text className="text-primaryForeground font-semibold ml-2 text-base">
            Share Join Code
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl items-center py-4 px-4"
        activeOpacity={0.8}
        onPress={async () => {
          if (user?.id) {
            await initializeLeagues(user.id);
          }
          router.replace('/(app)/(tabs)/League');
        }}
      >
        <Text className="text-primaryForeground text-lg font-bold">
          Start League
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
