export const QUERY_KEYS = {
  user: (userId: string) => ['users', userId] as const,
  member: (userId: string) => ['members', userId] as const,
  leagues: ['leagues'] as const,
  league: (id: number) => ['leagues', id] as const,
  myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
  leaderboard: (leagueId: string) => ['leaderboard', leagueId] as const,
  competitions: ['competitions'] as const,
  leagueByJoinCode: (joinCode: string) => ['leagues', 'joinCode', joinCode] as const,
};
