import { LoadingOverlay, Screen } from '@/components/layout';
import { Button, Image } from '@/components/ui';
import { useGetFullLeagueAndMembersById } from '@/hooks/useLeagues';

import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Clipboard,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LeagueCreatedScreen() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  console.log('useLocalSearchParams', leagueId);
  const { data: leagueData } = useGetFullLeagueAndMembersById(leagueId);
  const router = useRouter();

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
    <Screen>
      {/* Success Header */}
      <View className="items-center my-8">
        <Text className="text-2xl font-bold text-center mb-2 text-text">
          League Created Successfully! 🎉
        </Text>
        <Text className="text-base text-muted text-center">
          Your {leagueData?.competitions?.name || 'Football'} league is ready
        </Text>
      </View>

      {/* League Info Card */}
      <View className=" p-6  mx-3 border border-border rounded-2xl">
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
          <Text className="text-base text-muted text-center">
            {leagueData?.competitions?.country} •{' '}
            {leagueData?.competitions?.name}
          </Text>
        </View>

        <View className="rounded-xl p-4 mb-4 border border-border">
          <Text className="text-sm font-medium text-muted mb-1 text-center">
            Your Nickname
          </Text>
          <Text className="text-lg font-bold text-text text-center">
            {leagueData?.league_members[0]?.nickname}
          </Text>
        </View>

        <View className="p-4">
          <Text className="text-sm font-medium text-muted mb-3 text-center">
            League Join Code
          </Text>
          <TouchableOpacity
            onPress={handleCopyJoinCode}
            className=" border border-border rounded-lg p-4 mb-3"
          >
            <Text className="text-2xl font-mono font-bold text-primary text-center tracking-[8px]">
              {leagueData?.join_code}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-muted text-center">
            Tap to copy code
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-5 p-5">
        <Button
          onPress={handleShareJoinCode}
          title="Share Join Code"
          variant="secondary"
          size="md"
        />

        <Button
          onPress={() => {
            router.replace('/(app)/(tabs)/League');
          }}
          title="Start League"
          variant="primary"
          size="lg"
        />
      </View>
    </Screen>
  );
}
