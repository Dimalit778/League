export const QUERY_KEYS = {
  // ===== ROOT KEYS =====
  all: [
    'members',
    'leagues',
    'fixtures',
    'predictions',
    'subscriptions',
    'users',
    'competitions',
    'leaderboard',
  ] as const,

  // ===== USER RELATED =====
  users: {
    all: ['users'] as const,
    byId: (userId: string) => ['users', userId] as const,
    leagues: (userId: string) => ['users', userId, 'leagues'] as const,
  },

  // ===== MEMBER RELATED =====
  members: {
    all: ['members'] as const,
    byId: (memberId: string) => ['members', memberId] as const,
    stats: (memberId: string) => ['members', memberId, 'stats'] as const,
  },

  // ===== LEAGUE RELATED =====
  leagues: {
    all: ['leagues'] as const,
    byId: (leagueId: string) => ['leagues', leagueId] as const,
    byJoinCode: (joinCode: string) =>
      ['leagues', 'joinCode', joinCode] as const,
    myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
    fullLeagueAndMembers: (leagueId: string) =>
      ['leagues', leagueId, 'full'] as const,
  },

  // ===== FIXTURE RELATED =====
  fixtures: {
    all: ['fixtures'] as const,
    byId: (fixtureId: number) => ['fixtures', fixtureId] as const,
    byRound: (competitionId: number, round: string) =>
      ['fixtures', 'round', competitionId, round] as const,
    withPredictions: (competitionId: number, round: string, userId: string) =>
      ['fixtures', 'predictions', competitionId, round, userId] as const,
  },

  // ===== PREDICTION RELATED =====
  predictions: {
    all: ['predictions'] as const,
    byUser: (userId: string) => ['predictions', 'user', userId] as const,
    byFixture: (fixtureId: number) =>
      ['predictions', 'fixture', fixtureId] as const,
    byUserAndRound: (userId: string, round: string) =>
      ['predictions', 'user', userId, 'round', round] as const,
    leagueByFixture: (fixtureId: number, leagueId: string) =>
      ['predictions', 'league', leagueId, 'fixture', fixtureId] as const,
  },

  // ===== LEADERBOARD RELATED =====
  leaderboard: {
    all: ['leaderboard'] as const,
    byLeague: (leagueId: string) =>
      ['leaderboard', 'league', leagueId] as const,
  },

  // ===== COMPETITION RELATED =====
  competitions: {
    all: ['competitions'] as const,
    rounds: (leagueId: string) => ['competitions', 'rounds', leagueId] as const,
  },

  // ===== SUBSCRIPTION RELATED =====
  subscriptions: {
    all: ['subscriptions'] as const,
    byUser: (userId: string) => ['subscriptions', userId] as const,
    canCreateLeague: (userId: string) =>
      ['subscriptions', userId, 'canCreateLeague'] as const,
  },
} as const;
