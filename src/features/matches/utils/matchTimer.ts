type LiveMatchTimer = {
  status: string | null;

  // זמן תחילת המשחק
  kickoffAt: string;

  // הזמן שבו זיהינו שהמחצית השנייה התחילה
  secondHalfStartedAt?: string | null;
};

export function getMatchMinute(
  match: LiveMatchTimer,
  now = new Date()
): string {
  const {
    status,
    kickoffAt,
    secondHalfStartedAt,
  } = match;

  if (status === 'PAUSED') {
    return 'HT';
  }

  if (status === 'FINISHED') {
    return 'FT';
  }

  if (status !== 'IN_PLAY') {
    return '';
  }

  // מחצית שנייה
  if (secondHalfStartedAt) {
    const secondHalfStart =
      new Date(secondHalfStartedAt).getTime();

    const elapsedSecondHalf = Math.floor(
      (now.getTime() - secondHalfStart) / 60_000
    );

    const minute = 45 + elapsedSecondHalf;

    return `${Math.min(minute, 90)}'`;
  }

  // מחצית ראשונה
  const kickoff = new Date(kickoffAt).getTime();

  const elapsedFirstHalf = Math.floor(
    (now.getTime() - kickoff) / 60_000
  );

  const minute = Math.max(
    1,
    Math.min(elapsedFirstHalf, 45)
  );

  return `${minute}'`;
}