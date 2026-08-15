import { Button, Card, Divider, LoadingOverlay, LogoBadge, Screen, Text } from '@/components';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import * as Clipboard from 'expo-clipboard';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Share, View } from 'react-native';

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
        title: t('Copied!'),
        message: t('Join code copied to clipboard.'),
        type: 'success',
        buttons: [{ text: t('OK') }],
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
          <LogoBadge source={{ uri: leagueData?.competition?.logo as string }} width={84} height={84} />

          <Text variant="header">{leagueData?.name}</Text>
        </View>
        <Divider className="my-4" />
        <View className="items-center gap-2">
          <Text variant="label" tone="muted">
            {t('Your Nickname')}
          </Text>
          <Text variant="title">{leagueData?.league_members[0]?.nickname}</Text>
        </View>
        <Divider className="my-4" />
        <View className="items-center gap-3">
          <Text variant="label" tone="muted">
            {t('League Join Code')}
          </Text>

          <Card onPress={handleCopyJoinCode} variant="soft" padding="sm" contentClassName="items-center">
            <Text variant="header" tone="success">
              {leagueData?.join_code}
            </Text>
          </Card>
          <Text variant="caption" tone="muted">
            {t('Tap to copy code')}
          </Text>
        </View>
      </Card>
      {/* Action Buttons */}
      <View className="mt-8 gap-5 p-5">
        <Button onPress={handleShareJoinCode} label={t('Share Join Code')} variant="outline" size="md" />

        <Button onPress={handleStartLeague} label={t('Start League')} variant="primary" size="lg" />
      </View>
    </Screen>
  );
};

export default LeagueCreatedScreen;
