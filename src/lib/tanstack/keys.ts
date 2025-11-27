export const TOKENS = {
  pending: 'pending',
  me: 'me',
} as const;

//
// QUERY KEYS
//
export const QUERY_KEYS = {
  users: {
    all: ['users'] as const,
    byId: (userId?: string) => ['users', userId ?? TOKENS.me] as const,
    leagues: (userId?: string) => ['users', userId ?? TOKENS.me, 'leagues'] as const,
  },
  members: {
    byId: (memberId?: string) => ['members', memberId ?? TOKENS.pending] as const,
    stats: (memberId?: string) => ['members', memberId ?? TOKENS.pending, 'stats'] as const,
    predictions: (memberId?: string) => ['members', memberId ?? TOKENS.pending, 'predictions'] as const,
    dataAndStats: (memberId?: string) => ['members', memberId ?? TOKENS.pending, 'dataAndStats'] as const,
  },

  leagues: {
    all: ['leagues'] as const,
    byId: (leagueId?: string) => ['leagues', leagueId ?? TOKENS.pending] as const,
    byJoinCode: (joinCode?: string) => ['leagues', 'joinCode', joinCode ?? TOKENS.pending] as const,
    leagueAndMembers: (leagueId?: string) => ['leagues', leagueId ?? TOKENS.pending, 'full'] as const,
    members: (leagueId?: string) => ['leagues', leagueId ?? TOKENS.pending, 'members'] as const,
  },

  matches: {
    all: ['matches'] as const,
    allWithPredictions: (leagueId?: string) => ['matches', 'predictions', leagueId ?? TOKENS.pending] as const,
    byId: (matchId?: number) => ['matches', matchId ?? TOKENS.pending] as const,
    byIdWithPredictions: (leagueId?: string, matchId?: number) =>
      ['matches', 'predictions', matchId ?? TOKENS.pending, leagueId ?? TOKENS.pending] as const,
    byFixture: (fixture?: number, competitionId?: number) =>
      ['matches', 'fixture', fixture ?? TOKENS.pending, competitionId ?? TOKENS.pending] as const,
    byLeagueFixture: (leagueId?: string, fixture?: number) =>
      ['matches', 'league', leagueId ?? TOKENS.pending, 'fixture', fixture ?? TOKENS.pending] as const,
  },

  predictions: {
    all: ['predictions'] as const,
    byUser: (userId?: string) => ['predictions', 'user', userId ?? TOKENS.me] as const,
    byFixture: (fixtureId?: number) => ['predictions', 'fixture', fixtureId ?? TOKENS.pending] as const,
    byUserAndMatchday: (userId?: string, fixture?: number) =>
      ['predictions', 'user', userId ?? TOKENS.me, 'fixture', fixture ?? TOKENS.pending] as const,
    leagueByFixture: (fixtureId?: number, leagueId?: string) =>
      ['predictions', 'league', leagueId ?? TOKENS.pending, 'fixture', fixtureId ?? TOKENS.pending] as const,
  },

  leaderboard: {
    byLeague: (leagueId?: string) => ['leaderboard', 'league', leagueId ?? TOKENS.pending] as const,
    byMember: (memberId?: string) => ['leaderboard', 'member', memberId ?? TOKENS.pending] as const,
  },

  competitions: {
    all: ['competitions'] as const,
    fixturesByLeague: (leagueId?: string) => ['competitions', leagueId ?? TOKENS.pending, 'rounds'] as const,
  },

  subscriptions: {
    byUser: (userId?: string) => ['subscriptions', userId ?? TOKENS.me] as const,
    canCreateLeague: (userId?: string) => ['subscriptions', userId ?? TOKENS.me, 'canCreateLeague'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    leagues: ['admin', 'leagues'] as const,
    leagueMembers: ['admin', 'league-members'] as const,
    predictions: ['admin', 'predictions'] as const,
    competitions: ['admin', 'competitions'] as const,
  },
} as const;
