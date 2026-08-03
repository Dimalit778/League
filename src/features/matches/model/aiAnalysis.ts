import type { MatchWithPredictions } from '../types';

export type AiAnalysisState =
  | { status: 'unavailable' }
  | {
      status: 'available';
      summary: string;
      score: { home: number; away: number };
      generatedAt: Date;
    };

const isValidPredictedScore = (value: number | null): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 20;

export function resolveAiAnalysis(match: MatchWithPredictions, language: 'en' | 'he'): AiAnalysisState {
  const summary =
    language === 'he'
      ? (match.ai_summary_he ?? match.ai_summary_en ?? '').trim()
      : (match.ai_summary_en ?? match.ai_summary_he ?? '').trim();
  const generatedAt = match.ai_generated_at ? new Date(match.ai_generated_at) : null;

  if (
    !summary ||
    !isValidPredictedScore(match.ai_predicted_home_score) ||
    !isValidPredictedScore(match.ai_predicted_away_score) ||
    !generatedAt ||
    Number.isNaN(generatedAt.getTime())
  ) {
    return { status: 'unavailable' };
  }

  return {
    status: 'available',
    summary,
    score: {
      home: match.ai_predicted_home_score,
      away: match.ai_predicted_away_score,
    },
    generatedAt,
  };
}
