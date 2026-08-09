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
    leaguesSummary: (userId: string) => ['users', userId, 'leagues-summary'] as const,
  },

  // ==================== MEMBERS ====================
  members: {
    all: ['members'] as const,
    byId: (memberId: string) => ['members', memberId] as const,
    primaryLeague : (userId: string) => ['members', 'primary-league', userId] as const,
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
    roundLeaderboard: (leagueId: string) => ['leagues', leagueId, 'leaderboard', 'round'] as const,
  },

  // ==================== MATCHES ====================
  matches: {
    byFixture: (fixture?: number, competitionId?: number, seasonId?: number, memberId?: string) =>
      memberId
        ? (['matches', competitionId, seasonId, 'fixture', fixture, 'member', memberId] as const)
        : (['matches', competitionId, seasonId, 'fixture', fixture] as const),
    fixture: (competitionId: number, seasonId: number, fixture: number, memberId: string, stage?: string) =>
      ['matches', competitionId, seasonId, 'phase', 'fixture', fixture, 'member', memberId, stage ?? 'all'] as const,
    byCompetition: (competitionId: number, seasonId: number, memberId: string) =>
      ['matches', competitionId, seasonId, 'competition', 'member', memberId] as const,
    season: (competitionId: number, seasonId: number, memberId: string) =>
      ['matches', competitionId, seasonId, 'season', memberId] as const,
    nearest: (competitionId: number, seasonId: number, memberId: string) =>
      ['matches', competitionId, seasonId, 'nearest', memberId] as const,
    byCompetitionRoot: (competitionId: number) => ['matches', competitionId] as const,
    // Match with league predictions
    withPredictions: (leagueId: string, matchId: number) => ['matches', matchId, 'predictions', leagueId] as const,
    upcoming: (competitionId: number, seasonId: number, memberId: string) =>
      ['matches', competitionId, seasonId, 'upcoming', memberId] as const,
    finishedFixtures: (competitionId: number, seasonId: number) =>
      ['matches', competitionId, seasonId, 'finished-fixtures'] as const,
  },

  // ==================== PREDICTIONS ====================
  predictions: {
    all: ['predictions'] as const,
    // Member's predictions across all fixtures
    byMember: (memberId: string) => ['predictions', 'member', memberId] as const,
    byLeague: (leagueId: string) => ['predictions', 'league', leagueId] as const,
  },

  // ==================== MODERATION ====================
  moderation: {
    myReports: ['moderation', 'reports', 'me'] as const,
    blockedUsers: ['moderation', 'blocks'] as const,
    blockStatus: (targetUserId?: string | null) =>
      ['moderation', 'blocks', targetUserId ?? 'disabled'] as const,
  },

  // ==================== COMPETITIONS ====================
  competitions: {
    all: ['competitions'] as const,
    matchMeta: (competitionId: number) => ['competitions', competitionId.toString(), 'match-meta'] as const,
    leaderboard: (competitionId: number) => ['competitions', competitionId.toString(), 'leaderboard'] as const,
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
    reports: (status: string) => ['admin', 'reports', status] as const,
  },
} as const;
