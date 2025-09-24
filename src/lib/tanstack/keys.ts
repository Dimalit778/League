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
  fixtures: {
    all: ['fixtures'] as const,
    byId: (fixtureId?: number) =>
      ['fixtures', fixtureId ?? TOKENS.pending] as const,
    byRound: (competitionId?: number, round?: string) =>
      [
        'fixtures',
        'round',
        competitionId ?? TOKENS.pending,
        round ?? TOKENS.pending,
      ] as const,
    withPredictions: (
      competitionId?: number,
      round?: string,
      userId?: string
    ) =>
      [
        'fixtures',
        'predictions',
        competitionId ?? TOKENS.pending,
        round ?? TOKENS.pending,
        userId ?? TOKENS.me,
      ] as const,
    byLeagueRound: (leagueId?: string, round?: string) =>
      [
        'fixtures',
        'league',
        leagueId ?? TOKENS.pending,
        'round',
        round ?? TOKENS.pending,
      ] as const,
  },

  // ===== PREDICTION RELATED =====
  predictions: {
    all: ['predictions'] as const,
    byUser: (userId?: string) =>
      ['predictions', 'user', userId ?? TOKENS.me] as const,
    byFixture: (fixtureId?: number) =>
      ['predictions', 'fixture', fixtureId ?? TOKENS.pending] as const,
    byUserAndRound: (userId?: string, round?: string) =>
      [
        'predictions',
        'user',
        userId ?? TOKENS.me,
        'round',
        round ?? TOKENS.pending,
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
    roundsByLeague: (leagueId?: string) =>
      ['competitions', leagueId ?? TOKENS.pending, 'rounds'] as const,
  },

  // ===== SUBSCRIPTION RELATED =====
  subscriptions: {
    byUser: (userId?: string) =>
      ['subscriptions', userId ?? TOKENS.me] as const,
    canCreateLeague: (userId?: string) =>
      ['subscriptions', userId ?? TOKENS.me, 'canCreateLeague'] as const,
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
