export const PLAN_LIMITS = {
  FREE: {
    maxLeagues: 2,
    maxMembersPerLeague: [6],
    competitions: ['PD', 'BL1'],
    includesAiPrediction: true,
    includesAiAnalysis: false,
  },
  PRO: {
    maxLeagues: 5,
    maxMembersPerLeague: [6, 12],
    competitions: ['PD', 'BL1', 'PL', 'SA', 'CL', 'FL1'],
    includesAiPrediction: true,
    includesAiAnalysis: true,
  },
} as const;
