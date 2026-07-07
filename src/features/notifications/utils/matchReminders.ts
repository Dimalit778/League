import type { UpcomingMatchType } from '@/features/notifications/api/notificationsApi';
import { translateRaw } from '@/lib/i18n/translate';
import type { SupportedLanguage } from '@/store/LanguageStore';

export const MATCH_REMINDER_TYPE = 'match-reminder';
export const REMINDER_MINUTES_BEFORE_KICK_OFF = 60;

const REMINDER_IDENTIFIER_PREFIX = `${MATCH_REMINDER_TYPE}-`;

export type MatchReminderData = {
  type: typeof MATCH_REMINDER_TYPE;
  matchId: number;
  leagueId: string;
  competitionId: number;
};

export type PlannedReminder = {
  identifier: string;
  title: string;
  body: string;
  date: Date;
  data: MatchReminderData;
};

export const reminderIdentifier = (matchId: number) => `${REMINDER_IDENTIFIER_PREFIX}${matchId}`;

export const isReminderIdentifier = (identifier: string) => identifier.startsWith(REMINDER_IDENTIFIER_PREFIX);

// Build the desired reminder set: one notification per upcoming match,
// 60 minutes before kick-off. Matches whose reminder time has already
// passed (or that already started) are skipped.
export const buildMatchReminders = ({
  matches,
  leagueId,
  language,
  now = new Date(),
}: {
  matches: UpcomingMatchType[];
  leagueId: string;
  language: SupportedLanguage;
  now?: Date;
}): PlannedReminder[] => {
  const reminders: PlannedReminder[] = [];

  for (const match of matches) {
    if (!match.kick_off || !match.home_team?.name || !match.away_team?.name) continue;

    const kickOff = new Date(match.kick_off);
    if (Number.isNaN(kickOff.getTime()) || kickOff <= now) continue;

    const reminderDate = new Date(kickOff.getTime() - REMINDER_MINUTES_BEFORE_KICK_OFF * 60 * 1000);
    if (reminderDate <= now) continue;

    reminders.push({
      identifier: reminderIdentifier(match.id),
      title: translateRaw(language, 'Match starts soon'),
      body: translateRaw(language, 'match-reminder-body', {
        home: match.home_team.name,
        away: match.away_team.name,
      }),
      date: reminderDate,
      data: {
        type: MATCH_REMINDER_TYPE,
        matchId: match.id,
        leagueId,
        competitionId: match.competition_id,
      },
    });
  }

  return reminders;
};

export type ScheduledReminderSnapshot = {
  identifier: string;
  date: Date | null;
};

// Diff the currently scheduled reminders against the desired plan so a sync
// only cancels stale ones and schedules missing/changed ones — never touching
// notifications that are already correct (no duplicates, minimal churn).
export const diffReminders = (
  existing: ScheduledReminderSnapshot[],
  planned: PlannedReminder[],
): { toCancel: string[]; toSchedule: PlannedReminder[] } => {
  const plannedByIdentifier = new Map(planned.map((reminder) => [reminder.identifier, reminder]));
  const upToDate = new Set<string>();
  const toCancel: string[] = [];

  for (const scheduled of existing) {
    const match = plannedByIdentifier.get(scheduled.identifier);
    if (match && scheduled.date && scheduled.date.getTime() === match.date.getTime()) {
      upToDate.add(scheduled.identifier);
    } else {
      toCancel.push(scheduled.identifier);
    }
  }

  const toSchedule = planned.filter((reminder) => !upToDate.has(reminder.identifier));
  return { toCancel, toSchedule };
};
