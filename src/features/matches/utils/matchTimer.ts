export function getMatchMinute({
    status,
    kickoffAt,
    secondHalfStartedAt,
  }: {
    status: string;
    kickoffAt: string;
    secondHalfStartedAt?: string | null;
  }) {
    const normalizedStatus = status.toUpperCase();
  
    if (normalizedStatus === 'PAUSED') {
      return 'HT';
    }
  
    if (normalizedStatus === 'FINISHED') {
      return 'FT';
    }
  
    const isLive =
      normalizedStatus === 'LIVE' ||
      normalizedStatus === 'IN_PLAY';
  
    if (!isLive) {
      return '';
    }
  
    const now = Date.now();
  
    // מחצית שנייה
    if (secondHalfStartedAt) {
      const secondHalfStart = new Date(secondHalfStartedAt).getTime();
  
      const elapsedSecondHalf = Math.floor(
        (now - secondHalfStart) / 60_000
      );
  
      const minute = 45 + Math.max(0, elapsedSecondHalf);
  
      return `${minute}'`;
    }
  
    // מחצית ראשונה
    const kickoff = new Date(kickoffAt).getTime();
  
    if (Number.isNaN(kickoff)) {
      return '';
    }
  
    const elapsed = Math.floor(
      (now - kickoff) / 60_000
    );
  
    const minute = Math.max(1, Math.min(elapsed, 45));
  
    return `${minute}'`;
  }