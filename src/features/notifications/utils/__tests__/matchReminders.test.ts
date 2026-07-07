import type { UpcomingMatchType } from '@/features/notifications/api/notificationsApi';
import {
  buildMatchReminders,
  diffReminders,
  isReminderIdentifier,
  reminderIdentifier,
  type PlannedReminder,
} from '../matchReminders';

const NOW = new Date('2026-07-08T12:00:00.000Z');

const makeMatch = (overrides: Partial<UpcomingMatchType> = {}): UpcomingMatchType => ({
  id: 101,
  competition_id: 39,
  kick_off: '2026-07-08T18:00:00.000Z',
  status: 'TIMED',
  home_team: { name: 'Arsenal', shortName: 'ARS' },
  away_team: { name: 'Chelsea', shortName: 'CHE' },
  ...overrides,
});

describe('reminderIdentifier', () => {
  it('creates identifiers recognised by isReminderIdentifier', () => {
    expect(isReminderIdentifier(reminderIdentifier(42))).toBe(true);
    expect(isReminderIdentifier('some-other-notification')).toBe(false);
  });
});

describe('buildMatchReminders', () => {
  it('schedules 60 minutes before kick off', () => {
    const reminders = buildMatchReminders({
      matches: [makeMatch()],
      leagueId: 'league-1',
      language: 'en',
      now: NOW,
    });

    expect(reminders).toHaveLength(1);
    expect(reminders[0].date.toISOString()).toBe('2026-07-08T17:00:00.000Z');
    expect(reminders[0].identifier).toBe(reminderIdentifier(101));
    expect(reminders[0].data).toEqual({
      type: 'match-reminder',
      matchId: 101,
      leagueId: 'league-1',
      competitionId: 39,
    });
  });

  it('uses the English title and body with team names', () => {
    const [reminder] = buildMatchReminders({
      matches: [makeMatch()],
      leagueId: 'league-1',
      language: 'en',
      now: NOW,
    });

    expect(reminder.title).toBe('Match starts soon');
    expect(reminder.body).toBe('Arsenal vs Chelsea starts soon, enter your prediction for the match');
  });

  it('uses the Hebrew title and body with team names', () => {
    const [reminder] = buildMatchReminders({
      matches: [makeMatch()],
      leagueId: 'league-1',
      language: 'he',
      now: NOW,
    });

    expect(reminder.title).toBe('המשחק מתחיל בקרוב');
    expect(reminder.body).toBe('Arsenal נגד Chelsea מתחיל בקרוב, הכנס ניחוש למשחק');
  });

  it('skips matches that already started', () => {
    const reminders = buildMatchReminders({
      matches: [makeMatch({ kick_off: '2026-07-08T11:00:00.000Z' })],
      leagueId: 'league-1',
      language: 'en',
      now: NOW,
    });

    expect(reminders).toHaveLength(0);
  });

  it('skips matches whose reminder time already passed', () => {
    // Kick off in 30 minutes → reminder time was 30 minutes ago
    const reminders = buildMatchReminders({
      matches: [makeMatch({ kick_off: '2026-07-08T12:30:00.000Z' })],
      leagueId: 'league-1',
      language: 'en',
      now: NOW,
    });

    expect(reminders).toHaveLength(0);
  });

  it('skips matches with missing team names or invalid kick off', () => {
    const reminders = buildMatchReminders({
      matches: [
        makeMatch({ id: 1, home_team: null }),
        makeMatch({ id: 2, away_team: null }),
        makeMatch({ id: 3, kick_off: 'not-a-date' }),
      ],
      leagueId: 'league-1',
      language: 'en',
      now: NOW,
    });

    expect(reminders).toHaveLength(0);
  });
});

describe('diffReminders', () => {
  const planned: PlannedReminder = {
    identifier: reminderIdentifier(101),
    title: 'Match starts soon',
    body: 'Arsenal vs Chelsea starts soon, enter your prediction for the match',
    date: new Date('2026-07-08T17:00:00.000Z'),
    data: { type: 'match-reminder', matchId: 101, leagueId: 'league-1', competitionId: 39 },
  };

  it('keeps reminders that are already scheduled at the right time', () => {
    const { toCancel, toSchedule } = diffReminders(
      [{ identifier: planned.identifier, date: planned.date }],
      [planned],
    );

    expect(toCancel).toHaveLength(0);
    expect(toSchedule).toHaveLength(0);
  });

  it('cancels reminders that are no longer planned (e.g. primary league changed)', () => {
    const { toCancel, toSchedule } = diffReminders(
      [{ identifier: reminderIdentifier(999), date: new Date('2026-07-09T10:00:00.000Z') }],
      [planned],
    );

    expect(toCancel).toEqual([reminderIdentifier(999)]);
    expect(toSchedule).toEqual([planned]);
  });

  it('reschedules reminders whose fire date changed (match postponed)', () => {
    const { toCancel, toSchedule } = diffReminders(
      [{ identifier: planned.identifier, date: new Date('2026-07-08T15:00:00.000Z') }],
      [planned],
    );

    expect(toCancel).toEqual([planned.identifier]);
    expect(toSchedule).toEqual([planned]);
  });

  it('reschedules reminders with an unknown fire date', () => {
    const { toCancel, toSchedule } = diffReminders([{ identifier: planned.identifier, date: null }], [planned]);

    expect(toCancel).toEqual([planned.identifier]);
    expect(toSchedule).toEqual([planned]);
  });
});
