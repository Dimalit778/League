// Global query keys// Query Keys
export const queryKeys = {
    user: ['user'] as const,
    leagues: ['leagues'] as const,
    league: (id: string) => ['league', id] as const,
    leagueMembers: (leagueId: string) => ['leagueMembers', leagueId] as const,
    fixtures: (competitionId: number, season: number, round?: string) => 
      ['fixtures', competitionId, season, round] as const,
    rounds: (competitionId: number, season: number) => 
      ['rounds', competitionId, season] as const,
    matchDetails: (fixtureId: number, leagueId: string) => 
      ['matchDetails', fixtureId, leagueId] as const,
    competitions: ['competitions'] as const,
    userPredictions: (userId: string, leagueId: string) => 
      ['userPredictions', userId, leagueId] as const,
  };