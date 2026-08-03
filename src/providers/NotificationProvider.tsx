import { MATCH_REMINDER_TYPE } from '@/features/notifications/utils/matchReminders';
import { cancelAllMatchReminders, syncMatchReminders } from '@/features/notifications/utils/reminderScheduler';
import {
  getNotificationPermissionSnapshot,
  INITIAL_NOTIFICATION_PERMISSION,
  NotificationPermissionSnapshot,
  requestNotificationPermission,
  setupAndroidNotificationChannel,
} from '@/lib/notifications';
import { useAuthStore } from '@/store/AuthStore';
import { useLanguageStore } from '@/store/LanguageStore';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type NotificationPermissionContextValue = {
  permission: NotificationPermissionSnapshot;
  isRequesting: boolean;
  refreshPermission: () => Promise<NotificationPermissionSnapshot>;
  requestPermission: () => Promise<NotificationPermissionSnapshot>;
};

const NotificationPermissionContext = createContext<NotificationPermissionContextValue | null>(null);

export const useNotificationPermission = () => {
  const context = useContext(NotificationPermissionContext);
  if (!context) throw new Error('useNotificationPermission must be used inside NotificationProvider');
  return context;
};

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

  const [permission, setPermission] = useState<NotificationPermissionSnapshot>(INITIAL_NOTIFICATION_PERMISSION);
  const [isRequesting, setIsRequesting] = useState(false);
  const [pendingMatchId, setPendingMatchId] = useState<number | null>(null);
  const permissionGranted = permission.status === 'granted';

  // Serialize sync/cancel work so a logout can't interleave with an in-flight sync
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    setupAndroidNotificationChannel().catch(() => {});
  }, []);

  const refreshPermission = useCallback(async () => {
    const nextPermission = await getNotificationPermissionSnapshot();
    setPermission(nextPermission);
    return nextPermission;
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      const nextPermission = await requestNotificationPermission();
      setPermission(nextPermission);
      return nextPermission;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Read the real OS status without prompting. Refresh it after returning from
  // Settings so changes made outside the app are reflected immediately.
  useEffect(() => {
    if (Platform.OS === 'web' || !isLoggedIn) return;

    void refreshPermission().catch(() => {
      setPermission({ status: 'unavailable', canAskAgain: false });
    });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPermission().catch(() => {});
    });

    return () => subscription.remove();
  }, [isLoggedIn, refreshPermission]);

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

  const permissionContext = useMemo(
    () => ({ permission, isRequesting, refreshPermission, requestPermission }),
    [permission, isRequesting, refreshPermission, requestPermission],
  );

  return <NotificationPermissionContext.Provider value={permissionContext}>{children}</NotificationPermissionContext.Provider>;
};
