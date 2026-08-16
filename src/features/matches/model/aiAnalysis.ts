import type { AiSummaryType, MatchDetails } from '../types';

export type AiAnalysisState =
  | { status: 'unavailable' }
  | {
      status: 'available';
      score: { home: number; away: number };
      generatedAt: Date;
    };

const isValidPredictedScore = (value: number | null): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 20;

/**
 * Availability depends only on the predicted score + generation timestamp,
 * which are public columns. The written summary is PRO-gated and fetched
 * separately (see resolveAiSummaryText) — a free user should still see the
 * locked/blurred card, not "analysis not available".
 */
export function resolveAiAnalysis(match: MatchDetails): AiAnalysisState {
  const generatedAt = match.ai_generated_at ? new Date(match.ai_generated_at) : null;

  if (
    !isValidPredictedScore(match.ai_predicted_home_score) ||
    !isValidPredictedScore(match.ai_predicted_away_score) ||
    !generatedAt ||
    Number.isNaN(generatedAt.getTime())
  ) {
    return { status: 'unavailable' };
  }

  return {
    status: 'available',
    score: {
      home: match.ai_predicted_home_score,
      away: match.ai_predicted_away_score,
    },
    generatedAt,
  };
}

/** Resolves the language-appropriate summary text from a (PRO-only) fetched summary. */
export function resolveAiSummaryText(summary: AiSummaryType | undefined, language: 'en' | 'he'): string {
  if (!summary) return '';

  const text =
    language === 'he' ? (summary.ai_summary_he ?? summary.ai_summary_en) : (summary.ai_summary_en ?? summary.ai_summary_he);

  return text?.trim() ?? '';
}
