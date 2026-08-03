import { render } from '@testing-library/react-native';
import React from 'react';
import { MatchWithPredictions } from '../../types';
import { resolveAiAnalysis } from '../../model/aiAnalysis';
import AiAnalysisCard from '../match-details/AiAnalysisCard';

const createMatch = (overrides: Partial<MatchWithPredictions> = {}) =>
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
    ai_summary_en: 'A data-backed preview.',
    ai_summary_he: 'ניתוח המבוסס על נתונים.',
    ai_predicted_home_score: 0,
    ai_predicted_away_score: 0,
    ai_generated_at: '2026-08-02T12:00:00.000Z',
    ...overrides,
  }) as MatchWithPredictions;

describe('resolveAiAnalysis', () => {
  it('does not turn missing scores into a fake 0-0 prediction', () => {
    const state = resolveAiAnalysis(
      createMatch({ ai_predicted_home_score: null, ai_predicted_away_score: null }),
      'en',
    );

    expect(state).toEqual({ status: 'unavailable' });
  });

  it('renders the unavailable state without any invented score', () => {
    const match = createMatch({ ai_predicted_home_score: null, ai_predicted_away_score: null });
    const { getByText, queryByText } = render(React.createElement(AiAnalysisCard, { match }));

    expect(getByText('AI analysis is not available')).toBeTruthy();
    expect(queryByText(/^0$/)).toBeNull();
  });

  it('requires a complete summary and valid generation timestamp', () => {
    expect(resolveAiAnalysis(createMatch({ ai_summary_en: '   ', ai_summary_he: null }), 'en')).toEqual({
      status: 'unavailable',
    });
    expect(resolveAiAnalysis(createMatch({ ai_generated_at: 'invalid' }), 'en')).toEqual({ status: 'unavailable' });
  });

  it('preserves a legitimate generated 0-0 prediction', () => {
    const state = resolveAiAnalysis(createMatch(), 'en');

    expect(state.status).toBe('available');
    if (state.status === 'available') {
      expect(state.score).toEqual({ home: 0, away: 0 });
      expect(state.summary).toBe('A data-backed preview.');
      expect(state.generatedAt.toISOString()).toBe('2026-08-02T12:00:00.000Z');
    }
  });

  it('uses the selected language and falls back to the available summary', () => {
    const hebrew = resolveAiAnalysis(createMatch(), 'he');
    const fallback = resolveAiAnalysis(createMatch({ ai_summary_he: null }), 'he');

    expect(hebrew.status === 'available' && hebrew.summary).toBe('ניתוח המבוסס על נתונים.');
    expect(fallback.status === 'available' && fallback.summary).toBe('A data-backed preview.');
  });
});
