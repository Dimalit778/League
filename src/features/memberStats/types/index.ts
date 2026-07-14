type RoundPerformance = {
    round: number;
    points: number;
  };
  type PredictionRow = {
    points: number | null;
    is_finished: boolean;
    matches: { fixture: number | null; kick_off: string } | null;
  };
  
  
  type BestCategory = {
    name: string;
    value: number;
    topPercent: number | null;
  };
  
  type MemberStatsType = {
    totalPredictions: number;
    bingoHits: number;
    regularHits: number;
    missedHits: number;
    accuracy: number;
    totalPoints: number;
    position?: number | null;
    totalMembers?: number;
    currentStreak?: number;
    longestStreak?: number;
    roundPerformance?: RoundPerformance[];
    bestCategory?: BestCategory;
  };
  export type { BestCategory, MemberStatsType, PredictionRow, RoundPerformance };
