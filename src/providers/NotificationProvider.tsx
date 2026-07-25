import { MATCH_REMINDER_TYPE } from '@/features/notifications/utils/matchReminders';
import { cancelAllMatchReminders, syncMatchReminders } from '@/features/notifications/utils/reminderScheduler';
import { ensureNotificationPermission, setupAndroidNotificationChannel } from '@/lib/notifications';
import { useAuthStore } from '@/store/AuthStore';
import { useLanguageStore } from '@/store/LanguageStore';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const FOREGROUND_RESYNC_MIN_INTERVAL_MS = 15 * 60 * 1000;

const getReminderMatchId = (response: Notifications.NotificationResponse | null): number | null => {
  const data = response?.notification?.request?.content?.data;
  if (!data || data.type !== MATCH_REMINDER_TYPE) return null;
  const matchId = Number(data.matchId);
  return Number.isFinite(matchId) ? matchId : null;
};

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
  const memberId = usePrimaryLeagueStore((s) => s.memberId);
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId);
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId);
  const language = useLanguageStore((s) => s.language);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pendingMatchId, setPendingMatchId] = useState<number | null>(null);

  // Serialize sync/cancel work so a logout can't interleave with an in-flight sync
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    setupAndroidNotificationChannel().catch(() => {});
  }, []);

  // Ask for permission once, on the first logged-in open
  useEffect(() => {
    if (Platform.OS === 'web' || !isLoggedIn) return;
    let cancelled = false;

    ensureNotificationPermission()
      .then((granted) => {
        if (!cancelled) setPermissionGranted(granted);
      })
      .catch(() => {
        if (!cancelled) setPermissionGranted(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Keep scheduled reminders in step with auth state, primary league and language
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const shouldSchedule = isLoggedIn && permissionGranted && competitionId != null && leagueId != null;

    const run = () =>
      shouldSchedule ? syncMatchReminders({ competitionId, leagueId, language }) : cancelAllMatchReminders();

    syncChainRef.current = syncChainRef.current.then(run).then(
      () => {
        lastSyncAtRef.current = Date.now();
      },
      (error) => {
        Sentry.captureException(error, { tags: { feature: 'match-reminders' } });
      },
    );
  }, [isLoggedIn, permissionGranted, competitionId, leagueId, language]);

  // Refresh on foreground so postponed/rescheduled matches are picked up
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!isLoggedIn || !permissionGranted || competitionId == null || leagueId == null) return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (Date.now() - lastSyncAtRef.current < FOREGROUND_RESYNC_MIN_INTERVAL_MS) return;

      syncChainRef.current = syncChainRef.current
        .then(() => syncMatchReminders({ competitionId, leagueId, language }))
        .then(
          () => {
            lastSyncAtRef.current = Date.now();
          },
          (error) => {
            Sentry.captureException(error, { tags: { feature: 'match-reminders' } });
          },
        );
    });

    return () => subscription.remove();
  }, [isLoggedIn, permissionGranted, competitionId, leagueId, language]);

  // Notification taps: warm taps via the listener, cold starts via the last response
  useEffect(() => {
    if (Platform.OS === 'web') return;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        const matchId = getReminderMatchId(response);
        if (matchId != null) setPendingMatchId(matchId);
      })
      .catch(() => {});

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const matchId = getReminderMatchId(response);
      if (matchId != null) setPendingMatchId(matchId);
    });

    return () => subscription.remove();
  }, []);

  // Navigate once the auth + primary-member guards allow the match screen to mount
  useEffect(() => {
    if (pendingMatchId == null || !isLoggedIn || !memberId) return;

    setPendingMatchId(null);
    router.push({
      pathname: '/(app)/(league)/match/[matchId]',
      params: { matchId: String(pendingMatchId) },
    });
  }, [pendingMatchId, isLoggedIn, memberId]);

  return <>{children}</>;
};
