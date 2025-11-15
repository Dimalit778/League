import { LoadingOverlay, Screen } from '@/components/layout';
import { Button, MyImage } from '@/components/ui';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Share, Text, TouchableOpacity, View } from 'react-native';

const PreviewLeague = () => {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const { colors } = useThemeTokens();
  const { data: leagueData } = useGetLeagueAndMembers(leagueId);
  console.log('leagueData', JSON.stringify(leagueData, null, 2));
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
    <Screen>
      {!leagueData && <LoadingOverlay />}

      <View className="items-center my-8">
        <Text className="text-2xl font-bold text-center mb-2 text-primary font-nunito-black">
          League Created Successfully!
        </Text>
        <Text className="text-base text-muted text-center">
          Your {leagueData?.competition?.name || 'Football'} league is ready
        </Text>
      </View>

      <View className="px-4 py-6 mx-3 border border-border rounded-2xl">
        <View className="items-center mb-6">
          <View className="bg-gray-300 rounded-md p-1 w-16 h-16">
            <MyImage source={leagueData?.competition?.logo as string} />
          </View>

          <Text className="text-3xl text-center text-primary mb-2  font-nunito-black">{leagueData?.name}</Text>
          <Text className="text-base text-muted text-center">
            {leagueData?.competition?.area} • {leagueData?.competition?.name}
          </Text>
        </View>

        <View className="rounded-xl p-4 mb-4 border border-border">
          <Text className="text-sm font-medium text-muted mb-1 text-center">Your Nickname</Text>
          <Text className="text-lg font-bold text-text text-center">{leagueData?.league_members[0]?.nickname}</Text>
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
    </Screen>
  );
};

export default PreviewLeague;
