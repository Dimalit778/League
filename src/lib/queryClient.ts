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
    detail: (memberId: string) => ['members', memberId] as const,
    primary: (userId: string) => ['members', 'primary', userId] as const,
    stats: (memberId: string) => ['members', memberId, 'stats'] as const,
    predictions: (memberId: string) => ['members', memberId, 'predictions'] as const,
    dataAndStats: (memberId: string) => ['members', memberId, 'data-stats'] as const,
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
    detail: (matchId: number) => ['matches', matchId] as const,
    byFixture: (fixture?: number, competitionId?: number, memberId?: string) =>
      memberId
        ? (['matches', competitionId, 'fixture', fixture, 'member', memberId] as const)
        : (['matches', competitionId, 'fixture', fixture] as const),
    // Match with league predictions
    withPredictions: (leagueId: string, matchId: number) => ['matches', matchId, 'predictions', leagueId] as const,
  },

  // ==================== PREDICTIONS ====================
  predictions: {
    // Member's predictions across all fixtures
    byMember: (memberId: string) => ['predictions', 'member', memberId] as const,

    // Member's predictions for a specific fixture
    byFixture: (memberId: string, fixture: number) => ['predictions', 'member', memberId, 'fixture', fixture] as const,

    // All predictions in a league for a specific fixture
    byLeagueFixture: (leagueId: string, fixture: number) =>
      ['predictions', 'league', leagueId, 'fixture', fixture] as const,
  },

  // ==================== COMPETITIONS ====================
  competitions: {
    all: ['competitions'] as const,
    fixtures: (competitionId: number) => ['competitions', competitionId.toString(), 'fixtures'] as const,
  },

  // ==================== SUBSCRIPTIONS ====================
  subscriptions: {
    detail: (userId: string) => ['subscriptions', userId] as const,
    canCreateLeague: (userId: string) => ['subscriptions', userId, 'can-create'] as const,
  },

  // ==================== ADMIN ====================
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    leagues: ['admin', 'leagues'] as const,
    members: ['admin', 'members'] as const,
    predictions: ['admin', 'predictions'] as const,
    competitions: ['admin', 'competitions'] as const,
  },
} as const;
