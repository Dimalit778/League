export const TOKENS = {
  pending: 'pending',
  me: 'me',
} as const;

export const KEYS = {
  // ==================== USERS ====================
  users: {
    all: ['users'] as const,
    detail: (userId: string) => ['users', userId] as const,
    leagues: (userId: string) => ['users', userId, 'leagues'] as const,
  },

  // ==================== MEMBERS ====================
  members: {
    all: ['members'] as const,
    byId: (memberId: string) => ['members', memberId] as const,
    primary: (userId: string) => ['members', 'primary', userId] as const,
    byLeague: (userId: string, leagueId: string) => ['members', 'by-league', userId, leagueId] as const,
    stats: (memberId: string) => ['members', memberId, 'stats'] as const,
    detailsWithStats: (memberId: string) => ['members', memberId, 'details-with-stats'] as const,
    predictions: (memberId: string) => ['members', memberId, 'predictions'] as const,
    summary: (memberId: string) => ['members', memberId, 'summary'] as const,
  },

  // ==================== LEAGUES ====================
  leagues: {
    all: ['leagues'] as const,
    detail: (leagueId: string) => ['leagues', leagueId] as const,
    byJoinCode: (code: string) => ['leagues', 'code', code] as const,
    members: (leagueId: string) => ['leagues', leagueId, 'members'] as const,
    leaderboard: (leagueId: string) => ['leagues', leagueId, 'leaderboard'] as const,
  },

  // ==================== MATCHES ====================
  matches: {
    byFixture: (fixture?: number, competitionId?: number, memberId?: string) =>
      memberId
        ? (['matches', competitionId, 'fixture', fixture, 'member', memberId] as const)
        : (['matches', competitionId, 'fixture', fixture] as const),
    fixture: (competitionId: number, fixture: number, memberId: string, stage?: string) =>
      ['matches', competitionId, 'phase', 'fixture', fixture, 'member', memberId, stage ?? 'all'] as const,
    byCompetition: (competitionId: number, memberId: string) =>
      ['matches', competitionId, 'competition', 'member', memberId] as const,
    byCompetitionRoot: (competitionId: number) => ['matches', competitionId] as const,
    // Match with league predictions
    withPredictions: (leagueId: string, matchId: number) => ['matches', matchId, 'predictions', leagueId] as const,
    today: (competitionId: number, memberId: string) =>
      ['matches', competitionId, 'today', memberId] as const,
    activeStage: (competitionId: number) => ['matches', competitionId, 'active-stage'] as const,
    finishedFixtures: (competitionId: number) => ['matches', competitionId, 'finished-fixtures'] as const,
  },

  // ==================== PREDICTIONS ====================
  predictions: {
    // Member's predictions across all fixtures
    byMember: (memberId: string) => ['predictions', 'member', memberId] as const,
    byLeague: (leagueId: string) => ['predictions', 'league', leagueId] as const,
  },

  // ==================== COMPETITIONS ====================
  competitions: {
    all: ['competitions'] as const,
    matchMeta: (competitionId: number) => ['competitions', competitionId.toString(), 'match-meta'] as const,
  },


  // ==================== ADMIN ====================
  admin: {
    isAdmin: ['admin', 'isAdmin'] as const,
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    leagues: ['admin', 'leagues'] as const,
    leagueMembers: ['admin', 'league-members'] as const,
    predictions: ['admin', 'predictions'] as const,
    competitions: ['admin', 'competitions'] as const,
  },
} as const;
