import { notificationsApi } from '@/features/notifications/api/notificationsApi';
import {
  buildMatchReminders,
  diffReminders,
  isReminderIdentifier,
  type ScheduledReminderSnapshot,
} from '@/features/notifications/utils/matchReminders';
import { MATCH_REMINDERS_CHANNEL_ID } from '@/lib/notifications';
import { appStorage } from '@/lib/storage';
import type { SupportedLanguage } from '@/store/LanguageStore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const SNAPSHOT_KEY = 'notifications:scheduled-match-reminders';

// The OS is the source of truth for which reminders exist; this snapshot only
// remembers the fire date per identifier (reading dates back from OS triggers
// is not reliable cross-platform).
const readSnapshot = (): Record<string, number> => {
  try {
    return JSON.parse(appStorage.getString(SNAPSHOT_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const writeSnapshot = (snapshot: Record<string, number>) => {
  appStorage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
};

const getScheduledReminderIdentifiers = async (): Promise<string[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.map((request) => request.identifier).filter(isReminderIdentifier);
};

// Dev-only: inspect what match reminders are currently scheduled on the device
export const logScheduledMatchReminders = async () => {
  if (!__DEV__ || Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const snapshot = readSnapshot();
  const reminders = scheduled
    .filter((request) => isReminderIdentifier(request.identifier))
    .map((request) => ({
      identifier: request.identifier,
      firesAt: snapshot[request.identifier] ? new Date(snapshot[request.identifier]).toISOString() : 'unknown',
      body: request.content.body,
    }));

  console.log(`[match-reminders] ${reminders.length} scheduled`, reminders);
};

export const cancelAllMatchReminders = async () => {
  if (Platform.OS === 'web') return;

  const identifiers = await getScheduledReminderIdentifiers();
  await Promise.all(identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)));
  writeSnapshot({});
};

// Reconcile the OS-scheduled reminders with the upcoming matches of the
// primary league's competition: cancel stale ones, schedule missing ones.
export const syncMatchReminders = async ({
  competitionId,
  leagueId,
  language,
}: {
  competitionId: number;
  leagueId: string;
  language: SupportedLanguage;
}) => {
  if (Platform.OS === 'web') return;

  const matches = await notificationsApi.getUpcomingMatches(competitionId);
  const planned = buildMatchReminders({ matches, leagueId, language });

  const snapshot = readSnapshot();
  const existing: ScheduledReminderSnapshot[] = (await getScheduledReminderIdentifiers()).map((identifier) => ({
    identifier,
    date: snapshot[identifier] ? new Date(snapshot[identifier]) : null,
  }));

  const { toCancel, toSchedule } = diffReminders(existing, planned);

  await Promise.all(toCancel.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)));

  for (const reminder of toSchedule) {
    // Same identifier replaces any existing request, so re-scheduling can
    // never create a duplicate for the same match.
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.identifier,
      content: {
        title: reminder.title,
        body: reminder.body,
        data: reminder.data,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: MATCH_REMINDERS_CHANNEL_ID,
      },
    });
  }

  writeSnapshot(Object.fromEntries(planned.map((reminder) => [reminder.identifier, reminder.date.getTime()])));

  if (__DEV__) {
    void logScheduledMatchReminders();
  }
};
