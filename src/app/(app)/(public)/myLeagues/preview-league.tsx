import { LoadingOverlay } from '@/components/layout';
import { Button, MyImage } from '@/components/ui';
import { useGetLeagueAndMembers } from '@/hooks/useLeagues';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PreviewLeague = () => {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();

  const { data: leagueData } = useGetLeagueAndMembers(leagueId);
  const router = useRouter();

  const handleCopyJoinCode = async () => {
    if (typeof leagueData?.join_code === 'string') {
      await Clipboard.setStringAsync(leagueData?.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  const handleShareJoinCode = async () => {
    try {
      const shareMessage = `🏆 Join my ${leagueData?.competition?.area || 'Football'} league "${leagueData?.name}"!\n\nUse code: ${leagueData?.join_code}\n\nDownload the app to join!`;

      await Share.share({
        message: shareMessage,
        title: `Join ${leagueData?.name} League`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const handleStartLeague = async () => {
    router.replace('/(app)/(member)/(tabs)/League');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {!leagueData && <LoadingOverlay />}
      {/* Success Header */}
      <View className="items-center my-8">
        <Text className="text-2xl font-bold text-center mb-2 text-text">League Created Successfully! 🎉</Text>
        <Text className="text-base text-muted text-center">
          Your {leagueData?.competition?.name || 'Football'} league is ready
        </Text>
      </View>

      {/* League Info Card */}
      <View className=" p-6  mx-3 border border-border rounded-2xl">
        {/* Centered League Header */}
        <View className="items-center mb-6">
          <MyImage
            source={leagueData?.competition?.logo as string}
            className="rounded-2xl mb-4"
            width={80}
            height={80}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-center text-text mb-2 mt-4">{leagueData?.name}</Text>
          <Text className="text-base text-muted text-center">
            {leagueData?.competition?.area} • {leagueData?.competition?.name}
          </Text>
        </View>

        <View className="rounded-xl p-4 mb-4 border border-border">
          <Text className="text-sm font-medium text-muted mb-1 text-center">Your Nickname</Text>
          <Text className="text-lg font-bold text-text text-center">{leagueData?.owner?.nickname}</Text>
        </View>

        <View className="p-4">
          <Text className="text-sm font-medium text-muted mb-3 text-center">League Join Code</Text>
          <TouchableOpacity onPress={handleCopyJoinCode} className=" border border-border rounded-lg p-4 mb-3">
            <Text className="text-2xl font-mono font-bold text-primary text-center tracking-[8px]">
              {leagueData?.join_code}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-muted text-center">Tap to copy code</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-5 p-5">
        <Button onPress={handleShareJoinCode} title="Share Join Code" variant="secondary" size="md" />

        <Button onPress={handleStartLeague} title="Start League" variant="primary" size="lg" />
      </View>
    </SafeAreaView>
  );
};

export default PreviewLeague;
