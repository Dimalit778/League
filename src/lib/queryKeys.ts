export const QUERY_KEYS = {
  user: (userId: string) => ['users', userId] as const,
  member: (userId: string) => ['members', userId] as const,
  leagues: ['leagues'] as const,
  league: (id: number) => ['leagues', id] as const,
  myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
  allFixtures: (userId: string, round: string, competitionId: number) => ['fixtures', userId, round, competitionId] as const,
  
  fixture: (memberId: string, userId: string) => ['fixtures', memberId, userId] as const,


  
  leaderboard: (leagueId: string) => ['leaderboard', leagueId] as const,
  competitions: ['competitions'] as const,
  leagueByJoinCode: (joinCode: string) => ['leagues', 'joinCode', joinCode] as const,
};
