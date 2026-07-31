import { LoadingOverlay, Screen } from '@/components/layout';
import { Button, Card, Divider, MyImage, Text } from '@/components/ui';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import * as Clipboard from 'expo-clipboard';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Share, TouchableOpacity, View } from 'react-native';

const LeagueCreatedScreen = () => {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const { data: leagueData } = useGetLeagueAndMembers(leagueId);
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleCopyJoinCode = async () => {
    if (typeof leagueData?.join_code === 'string') {
      await Clipboard.setStringAsync(leagueData?.join_code || '');
      showAlert({
        title: 'Copied!',
        message: 'Join code copied to clipboard.',
        type: 'success',
        buttons: [{ text: 'OK' }],
      });
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
        },
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
    router.replace(`/(app)/(league)` as Href);
  };

  return (
    <Screen padding="horizontal" edges={['top', 'bottom']}>
      {!leagueData && <LoadingOverlay />}

      <View className="items-center my-8">
        <Text variant="title" tone="primary">
          {t('League Created Successfully!')}
        </Text>
      </View>

      <Card>
        <View className="items-center  gap-4">
          <View className="bg-gray-300 rounded-md p-1 w-24 h-24 ">
            <MyImage source={leagueData?.competition?.logo as string} />
          </View>

          <Text variant="header">{leagueData?.name}</Text>
        </View>
        <Divider className="my-4" />
        <View className="items-center gap-2">
          <Text variant="subtitle" tone="muted">
            {t('Your Nickname')}
          </Text>
          <Text variant="title">{leagueData?.league_members[0]?.nickname}</Text>
        </View>
        <Divider className="my-4" />
        <View className="items-center gap-3">
          <Text variant="subtitle" tone="muted">
            {t('League Join Code')}
          </Text>

          <TouchableOpacity onPress={handleCopyJoinCode} className=" items-center bg-surfaceElevated rounded-lg p-2 ">
            <Text variant="header" tone="success">
              {leagueData?.join_code}
            </Text>
          </TouchableOpacity>
          <Text variant="bodySmall" tone="muted">
            {t('Tap to copy code')}
          </Text>
        </View>
      </Card>
      {/* Action Buttons */}
      <View className="gap-5 p-5">
        <Button onPress={handleShareJoinCode} label={t('Share Join Code')} variant="outline" size="md" />

        <Button onPress={handleStartLeague} label={t('Start League')} variant="primary" size="lg" />
      </View>
    </Screen>
  );
};

export default LeagueCreatedScreen;
