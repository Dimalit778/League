import { useQuery } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import { resolveAiAnalysis, resolveAiSummaryText } from '../../model/aiAnalysis';
import { AiSummaryType, MatchDetails } from '../../types';
import AiAnalysisCard from '../match-details/AiAnalysisCard';

const createMatch = (overrides: Partial<MatchDetails> = {}) =>
  ({
    id: 10,
    competition_id: 39,
    fixture: 1,
    kick_off: '2026-08-10T18:00:00.000Z',
    stage: 'REGULAR_SEASON',
    group: null,
    home_team_id: 1,
    away_team_id: 2,
    status: 'TIMED',
    score: null,
    home_team: null,
    away_team: null,
    predictions: [],
    ai_predicted_home_score: 0,
    ai_predicted_away_score: 0,
    ai_generated_at: '2026-08-02T12:00:00.000Z',
    ...overrides,
  }) as MatchDetails;

describe('resolveAiAnalysis', () => {
  it('does not turn missing scores into a fake 0-0 prediction', () => {
    const state = resolveAiAnalysis(
      createMatch({ ai_predicted_home_score: null, ai_predicted_away_score: null }),
    );

    expect(state).toEqual({ status: 'unavailable' });
  });

  it('renders the unavailable state without any invented score', () => {
    const match = createMatch({ ai_predicted_home_score: null, ai_predicted_away_score: null });
    const { getByText, queryByText } = render(React.createElement(AiAnalysisCard, { match }));

    expect(getByText('AI analysis is available on match day')).toBeTruthy();
    expect(queryByText(/^0$/)).toBeNull();
  });

  it('requires a valid generation timestamp, independent of the (PRO-gated) summary', () => {
    expect(resolveAiAnalysis(createMatch({ ai_generated_at: 'invalid' }))).toEqual({ status: 'unavailable' });
  });

  it('preserves a legitimate generated 0-0 prediction', () => {
    const state = resolveAiAnalysis(createMatch());

    expect(state.status).toBe('available');
    if (state.status === 'available') {
      expect(state.score).toEqual({ home: 0, away: 0 });
      expect(state.generatedAt.toISOString()).toBe('2026-08-02T12:00:00.000Z');
    }
  });

  it('is available even when the summary has not been fetched (e.g. a free user)', () => {
    // No ai_summary_en/he on MatchDetails at all anymore — the type
    // no longer carries them, since they come from a separate PRO-gated fetch.
    const state = resolveAiAnalysis(createMatch());
    expect(state.status).toBe('available');
  });
});

describe('resolveAiSummaryText', () => {
  const summary: AiSummaryType = { ai_summary_en: 'A data-backed preview.', ai_summary_he: 'ניתוח המבוסס על נתונים.' };

  it('returns empty string when no summary was fetched', () => {
    expect(resolveAiSummaryText(undefined, 'en')).toBe('');
  });

  it('uses the selected language and falls back to the available summary', () => {
    expect(resolveAiSummaryText(summary, 'he')).toBe('ניתוח המבוסס על נתונים.');
    expect(resolveAiSummaryText({ ...summary, ai_summary_he: null }, 'he')).toBe('A data-backed preview.');
    expect(resolveAiSummaryText(summary, 'en')).toBe('A data-backed preview.');
  });
});

describe('AiAnalysisCard', () => {
  it('shows the locked placeholder for a free user even though an analysis exists', () => {
    const match = createMatch();
    const { getByText } = render(React.createElement(AiAnalysisCard, { match }));

    expect(getByText('Unlock the full AI analysis with Pro')).toBeTruthy();
  });

  it('does not fetch the summary for a free user', () => {
    const match = createMatch();
    render(React.createElement(AiAnalysisCard, { match }));

    const aiSummaryCall = jest
      .mocked(useQuery)
      .mock.calls.find(([config]) => (config as { queryKey?: unknown[] }).queryKey?.[2] === 'ai-summary');
    expect((aiSummaryCall?.[0] as { queryFn?: unknown })?.queryFn).toBeUndefined();
  });
});
