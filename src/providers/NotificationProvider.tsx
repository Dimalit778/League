import {
  getNotificationPermissionSnapshot,
  INITIAL_NOTIFICATION_PERMISSION,
  NotificationPermissionSnapshot,
  requestNotificationPermission,
  setupAndroidNotificationChannel,
} from '@/lib/notifications';
import { clearPushToken, registerPushToken } from '@/lib/notifications/pushToken';
import { useAuthStore } from '@/store/AuthStore';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

// Kept for tap-to-navigate: matches the `type` field on reminder push payloads.
const MATCH_REMINDER_TYPE = 'match-reminder';

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

  const [permission, setPermission] = useState<NotificationPermissionSnapshot>(INITIAL_NOTIFICATION_PERMISSION);
  const [isRequesting, setIsRequesting] = useState(false);
  const [pendingMatchId, setPendingMatchId] = useState<number | null>(null);
  const permissionGranted = permission.status === 'granted';

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

  // Keep the remote push token in sync with auth + permission state. Registration
  // is a cheap, idempotent upsert, so a single call on grant/login is sufficient.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (isLoggedIn && permissionGranted) {
      void registerPushToken();
    } else if (isLoggedIn && permission.status === 'denied') {
      // Definitive revoke while still logged in (logout itself is handled in
      // authApi.signOut, before the session is torn down). Don't clear on
      // 'loading' | 'undetermined' | 'unavailable' — those are transient
      // states during initial permission resolution, not a revoke.
      void clearPushToken();
    }
  }, [isLoggedIn, permissionGranted, permission.status]);

  // Re-register on foreground while granted, in case the token rotated.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!isLoggedIn || !permissionGranted) return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void registerPushToken();
    });

    return () => subscription.remove();
  }, [isLoggedIn, permissionGranted]);

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
