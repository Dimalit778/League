import { LoadingOverlay, Screen } from '@/components/layout';
import { Button, CText, MyImage } from '@/components/ui';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Share, TouchableOpacity, View } from 'react-native';

const PreviewLeague = () => {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const { data: leagueData } = useGetLeagueAndMembers(leagueId);
  const { t } = useTranslation();
  const router = useRouter();

  const handleCopyJoinCode = async () => {
    if (typeof leagueData?.join_code === 'string') {
      await Clipboard.setStringAsync(leagueData?.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  const handleShareJoinCode = async () => {
    try {
      const shareMessage = `🏆 ${t(
        'Join my {{area}} league "{{name}}"!\n\nUse code: {{join_code}}\n\nDownload the app to join!',
        {
          area: leagueData?.competition?.area || 'Football',
          name: leagueData?.name || '',
          join_code: leagueData?.join_code || '',
        }
      )}`;

      await Share.share({
        message: shareMessage,
        title: `Join ${leagueData?.name} League`,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleStartLeague = async () => {
    router.replace('/(app)/(member)/(tabs)/League');
  };

  return (
    <Screen>
      {!leagueData && <LoadingOverlay />}

      <View className="items-center my-8">
        <CText className="text-2xl font-bold text-center mb-2 text-primary font-nunito-black">
          {t('League Created Successfully!')}
        </CText>
      </View>

      <View className="px-4 py-6 mx-3 border border-border rounded-2xl">
        <View className="items-center mb-6">
          <View className="bg-gray-300 rounded-md p-1 w-16 h-16">
            <MyImage source={leagueData?.competition?.logo as string} />
          </View>

          <CText className="text-3xl text-center text-primary mb-2  font-nunito-black">{leagueData?.name}</CText>
          <CText className="text-base text-muted text-center">
            {t(leagueData?.competition?.area || '')} • {t(leagueData?.competition?.name || '')}
          </CText>
        </View>

        <View className="rounded-xl p-4 mb-4 border border-border">
          <CText className="text-sm font-medium text-muted mb-1 text-center">{t('Your Nickname')}</CText>
          <CText className="text-lg font-bold text-text text-center">{leagueData?.league_members[0]?.nickname}</CText>
        </View>

        <View className="p-4">
          <CText className="text-sm font-medium text-muted mb-3 text-center">{t('League Join Code')}</CText>
          <TouchableOpacity onPress={handleCopyJoinCode} className=" border border-border rounded-lg p-4 mb-3">
            <CText className="text-2xl font-mono font-bold text-primary text-center tracking-[8px]">
              {leagueData?.join_code}
            </CText>
          </TouchableOpacity>
          <CText className="text-xs text-muted text-center">{t('Tap to copy code')}</CText>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-5 p-5">
        <Button onPress={handleShareJoinCode} title={t('Share Join Code')} variant="secondary" size="md" />

        <Button onPress={handleStartLeague} title={t('Start League')} variant="primary" size="lg" />
      </View>
    </Screen>
  );
};

export default PreviewLeague;
