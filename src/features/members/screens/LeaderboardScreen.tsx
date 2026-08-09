import { images } from '@/assets/images';
import { CollapsibleHeader, Error, Row, Text } from '@/components';
import {
  useGetCompetitionLeaderboard,
  useGetLeaderboard,
  useGetLeagueAndMembers,
  useGetRoundLeaderboard,
} from '@/features/leagues/hooks/useLeagues';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useCompetitionId, useLeagueId } from '@/store/PrimaryLeagueStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { InviteFriendsCard } from '../components/leaderboard/InviteFriendsCard';
import { LeaderboardAudienceToggle, type LeaderboardAudience } from '../components/leaderboard/LeaderboardAudienceToggle';
import { LeaderboardList } from '../components/leaderboard/LeaderboardList';
import { LeaderboardScopeToggle, type LeaderboardScope } from '../components/leaderboard/LeaderboardScopeToggle';
import LeaderboardSkeleton, { LeaderboardBodySkeleton } from '../components/leaderboard/LeaderboardSkeleton';
import { Podium } from '../components/leaderboard/Pudiom';

const Header = ({
  audience,
  setAudience,
}: {
  audience: LeaderboardAudience;
  setAudience: (audience: LeaderboardAudience) => void;
}) => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="w-full ">
      <View className="relative w-full justify-center px-2.5 h-12">
        <View className="absolute inset-0 items-center justify-center px-14" pointerEvents="box-none">
          <LeaderboardAudienceToggle value={audience} onChange={setAudience} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('My leagues')}
          hitSlop={4}
          onPress={() => router.push('/(app)/(user)/leagues/my-leagues')}
          className="z-10 items-center justify-center rounded-full border border-border bg-subtle active:opacity-70 w-12 h-12"
          style={{
            position: 'absolute',
            end: 10,
            top: 0,
          }}
        >
          <Trophy color={colors.text} size={23} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default function LeaderboardScreen() {
  const leagueId = useLeagueId();
  const competitionId = useCompetitionId();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [audience, setAudience] = useState<LeaderboardAudience>('friends');
  const [scope, setScope] = useState<LeaderboardScope>('season');

  const seasonQuery = useGetLeaderboard(leagueId);
  const roundQuery = useGetRoundLeaderboard(leagueId);
  const worldQuery = useGetCompetitionLeaderboard(competitionId);

  const friendsQuery = scope === 'round' ? roundQuery : seasonQuery;
  const activeQuery = audience === 'world' ? worldQuery : friendsQuery;
  const { data: leaderboard, isLoading: activeIsLoading, error } = activeQuery;

  const { data: league } = useGetLeagueAndMembers(leagueId);
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const topThree = useMemo(() => leaderboard?.slice(0, 3) ?? [], [leaderboard]);
  const rest = leaderboard?.slice(3) ?? [];

  const avatarPaths = useMemo(
    () => [...new Set((leaderboard ?? []).map((m) => m.avatar_url).filter((path): path is string => !!path))],
    [leaderboard],
  );

  useEffect(() => {
    if (avatarPaths.length === 0) return;
    const urls = avatarPaths.map((path) => getProfileImage(path)).filter((url): url is string => !!url);
    ExpoImage.prefetch(urls, { cachePolicy: 'memory-disk' }).catch(() => false);
  }, [avatarPaths]);

  const handleInviteFriends = async () => {
    if (!league) return;

    try {
      await Share.share({
        message: t('Join my {{area}} league "{{name}}"!\n\nUse code: {{join_code}}\n\nDownload the app to join!', {
          area: league.competition?.area || 'Football',
          name: league.name,
          join_code: league.join_code,
        }),
        title: t('Join {{name}} League', { name: league.name }),
      });
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to share invite code'),
        type: 'warning',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  if (error) return <Error error={error} />;
  if (!seasonQuery.data && seasonQuery.isLoading) return <LeaderboardSkeleton />;

  const isClickable = audience === 'friends';
  const bodyIsLoading = activeIsLoading || !leaderboard;

  return (
    <CollapsibleHeader
      variant="fixed"
      expandedHeight={280}
      fixedBackgroundRevealStart={40}
      fixedBackgroundRevealDistance={30}
      backgroundImage={images.stadium}
      overlap={200}
      collapsedHeader={<Header audience={audience} setAudience={setAudience} />}
    >
      <View className="gap-6 px-4 pt-2">
        {audience === 'friends' ? <LeaderboardScopeToggle value={scope} onChange={setScope} /> : null}

        {bodyIsLoading ? (
          <LeaderboardBodySkeleton />
        ) : (
          <>
            <Podium first={topThree[0]} second={topThree[1]} third={topThree[2]} clickable={isClickable} />

            {rest.length > 0 ? (
              <View className="gap-4">
                <Row keepLtr className="gap-3">
                  <View className="h-px flex-1 bg-border" />
                  <Text variant="label" tone="muted" className="font-semibold uppercase tracking-wide">
                    {t('Full ranking')}
                  </Text>
                  <View className="h-px flex-1 bg-border" />
                </Row>
                <LeaderboardList leaderboard={rest} currentUserId={currentUserId} clickable={isClickable} />
              </View>
            ) : null}

            {audience === 'friends' ? (
              <InviteFriendsCard onInvite={handleInviteFriends} disabled={!league} />
            ) : null}
          </>
        )}
      </View>
    </CollapsibleHeader>
  );
}
