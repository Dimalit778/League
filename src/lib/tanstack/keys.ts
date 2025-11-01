export const TOKENS = {
  pending: 'pending',
  me: 'me',
} as const;

//
// QUERY KEYS
//
export const QUERY_KEYS = {
  // ===== USER RELATED =====
  users: {
    all: ['users'] as const,
    byId: (userId?: string) => ['users', userId ?? TOKENS.me] as const,
    leagues: (userId?: string) =>
      ['users', userId ?? TOKENS.me, 'leagues'] as const,
  },

  // ===== MEMBER RELATED =====
  members: {
    byId: (memberId?: string) =>
      ['members', memberId ?? TOKENS.pending] as const,
    stats: (memberId?: string) =>
      ['members', memberId ?? TOKENS.pending, 'stats'] as const,
    avatar: (memberId?: string) =>
      ['members', memberId ?? TOKENS.pending, 'avatar'] as const,
  },

  // ===== LEAGUE RELATED =====
  leagues: {
    all: ['leagues'] as const,
    byId: (leagueId?: string) =>
      ['leagues', leagueId ?? TOKENS.pending] as const,
    byJoinCode: (joinCode?: string) =>
      ['leagues', 'joinCode', joinCode ?? TOKENS.pending] as const,
    leagueAndMembers: (leagueId?: string) =>
      ['leagues', leagueId ?? TOKENS.pending, 'full'] as const,
    members: (leagueId?: string) =>
      ['leagues', leagueId ?? TOKENS.pending, 'members'] as const,
  },

  // ===== FIXTURE RELATED =====
  matches: {
    all: ['matches'] as const,
    byId: (matchId?: number) => ['matches', matchId ?? TOKENS.pending] as const,
    byMatchday: (competitionId?: number, matchday?: number) =>
      [
        'matches',
        'matchday',
        competitionId ?? TOKENS.pending,
        matchday ?? TOKENS.pending,
      ] as const,
    withPredictions: (
      competitionId?: number,
      matchday?: number,
      userId?: string
    ) =>
      [
        'matches',
        'predictions',
        competitionId ?? TOKENS.pending,
        matchday ?? TOKENS.pending,
        userId ?? TOKENS.me,
      ] as const,
    byLeagueMatchday: (leagueId?: string, matchday?: number) =>
      [
        'matches',
        'league',
        leagueId ?? TOKENS.pending,
        'matchday',
        matchday ?? TOKENS.pending,
      ] as const,
  },

  // ===== PREDICTION RELATED =====
  predictions: {
    all: ['predictions'] as const,
    byUser: (userId?: string) =>
      ['predictions', 'user', userId ?? TOKENS.me] as const,
    byFixture: (fixtureId?: number) =>
      ['predictions', 'fixture', fixtureId ?? TOKENS.pending] as const,
    byUserAndMatchday: (userId?: string, matchday?: number) =>
      [
        'predictions',
        'user',
        userId ?? TOKENS.me,
        'matchday',
        matchday ?? TOKENS.pending,
      ] as const,
    leagueByFixture: (fixtureId?: number, leagueId?: string) =>
      [
        'predictions',
        'league',
        leagueId ?? TOKENS.pending,
        'fixture',
        fixtureId ?? TOKENS.pending,
      ] as const,
  },

  // ===== LEADERBOARD RELATED =====
  leaderboard: {
    byLeague: (leagueId?: string) =>
      ['leaderboard', 'league', leagueId ?? TOKENS.pending] as const,
  },

  // ===== COMPETITION RELATED =====
  competitions: {
    all: ['competitions'] as const,
    matchdaysByLeague: (leagueId?: string) =>
      ['competitions', leagueId ?? TOKENS.pending, 'rounds'] as const,
  },

  // ===== SUBSCRIPTION RELATED =====
  subscriptions: {
    byUser: (userId?: string) =>
      ['subscriptions', userId ?? TOKENS.me] as const,
    canCreateLeague: (userId?: string) =>
      ['subscriptions', userId ?? TOKENS.me, 'canCreateLeague'] as const,
  },
  // ===== ADMIN RELATED =====
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    leagues: ['admin', 'leagues'] as const,
    leagueMembers: ['admin', 'league-members'] as const,
    predictions: ['admin', 'predictions'] as const,
    competitions: ['admin', 'competitions'] as const,
  },
} as const;
// export const QUERY_KEYS = {
//   // ===== USER RELATED =====
//   users: {
//     all: ['users'] as const,
//     byId: (userId: string) => ['users', userId] as const,
//     leagues: (userId: string) => ['users', userId, 'leagues'] as const,
//   },

//   // ===== MEMBER RELATED =====
//   members: {
//     byId: (memberId: string) => ['members', memberId] as const,
//     stats: (memberId: string) => ['members', memberId, 'stats'] as const,
//   },

//   // ===== LEAGUE RELATED =====
//   leagues: {
//     byId: (leagueId: string) => ['leagues', leagueId] as const,
//     byJoinCode: (joinCode: string) =>
//       ['leagues', 'joinCode', joinCode] as const,
//     leagueAndMembers: (leagueId: string) =>
//       ['leagues', leagueId, 'full'] as const,
//   },

//   // ===== FIXTURE RELATED =====
//   fixtures: {
//     all: ['fixtures'] as const,
//     byId: (fixtureId: number) => ['fixtures', fixtureId] as const,
//     byRound: (competitionId: number, round: string) =>
//       ['fixtures', 'round', competitionId, round] as const,
//     withPredictions: (competitionId: number, round: string, userId: string) =>
//       ['fixtures', 'predictions', competitionId, round, userId] as const,
//   },

//   // ===== PREDICTION RELATED =====
//   predictions: {
//     all: ['predictions'] as const,
//     byUser: (userId: string) => ['predictions', 'user', userId] as const,
//     byFixture: (fixtureId: number) =>
//       ['predictions', 'fixture', fixtureId] as const,
//     byUserAndRound: (userId: string, round: string) =>
//       ['predictions', 'user', userId, 'round', round] as const,
//     leagueByFixture: (fixtureId: number, leagueId: string) =>
//       ['predictions', 'league', leagueId, 'fixture', fixtureId] as const,
//   },

//   // ===== LEADERBOARD RELATED =====
//   leaderboard: {
//     byLeague: (leagueId: string) =>
//       ['leaderboard', 'league', leagueId] as const,
//   },

//   // ===== COMPETITION RELATED =====
//   competitions: {
//     all: ['competitions'] as const,
//     rounds: (leagueId: string) => ['competitions', 'rounds', leagueId] as const,
//   },

//   // ===== SUBSCRIPTION RELATED =====
//   subscriptions: {
//     byUser: (userId: string) => ['subscriptions', userId] as const,
//     canCreateLeague: (userId: string) =>
//       ['subscriptions', userId, 'canCreateLeague'] as const,
//   },
// } as const;
