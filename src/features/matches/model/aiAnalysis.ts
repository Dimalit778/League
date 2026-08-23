import type { AiSummaryType, MatchDetails } from "../types";

export type AiAnalysisState =
  | { status: "unavailable" }
  | {
    status: "available";
    score: { home: number; away: number };
    generatedAt: Date;
  };

const isValidPredictedScore = (value: number | null): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 &&
  value <= 20;

export function resolveAiAnalysis(match: MatchDetails): AiAnalysisState {
  const generatedAt = match.ai_generated_at
    ? new Date(match.ai_generated_at)
    : null;

  if (
    !isValidPredictedScore(match.ai_predicted_home_score) ||
    !isValidPredictedScore(match.ai_predicted_away_score) ||
    !generatedAt ||
    Number.isNaN(generatedAt.getTime())
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "available",
    score: {
      home: match.ai_predicted_home_score,
      away: match.ai_predicted_away_score,
    },
    generatedAt,
  };
}

export function resolveAiSummaryText(
  summary: AiSummaryType | undefined,
  language: "en" | "he",
): string {
  if (!summary) return "";

  const text = language === "he"
    ? (summary.ai_summary_he ?? summary.ai_summary_en)
    : (summary.ai_summary_en ?? summary.ai_summary_he);

  return text?.trim() ?? "";
}

export function splitSummaryParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
