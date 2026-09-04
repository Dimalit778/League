import { deriveMatchPresentation } from '../matchPresentation';

const kickoff = '2026-08-15T17:30:00.000Z';

describe('deriveMatchPresentation', () => {
  it('keeps predictions open before a scheduled kickoff', () => {
    const result = deriveMatchPresentation(
      { status: 'SCHEDULED', kickOff: kickoff },
      new Date('2026-08-15T17:00:00.000Z'),
    );

    expect(result).toMatchObject({ phase: 'scheduled', canPredict: true, scoreMode: 'versus' });
  });

  it('closes predictions when kickoff passes even if the provider status is delayed', () => {
    const result = deriveMatchPresentation(
      { status: 'TIMED', kickOff: kickoff },
      new Date('2026-08-15T17:31:00.000Z'),
    );

    expect(result).toMatchObject({ phase: 'scheduled', canPredict: false, scoreMode: 'kickoff-time' });
  });

  it.each(['IN_PLAY', 'LIVE', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'])('normalizes %s as live', (status) => {
    const result = deriveMatchPresentation(
      { status, kickOff: kickoff },
      new Date('2026-08-15T18:04:00.000Z'),
    );

    expect(result.phase).toBe('live');
    expect(result.cardStatusLabel).toBe('LIVE');
    expect(result.canPredict).toBe(false);
    expect(result.scoreMode).toBe('score');
  });

  it('represents a paused match as halftime', () => {
    expect(deriveMatchPresentation({ status: 'PAUSED', kickOff: kickoff })).toMatchObject({
      phase: 'halftime',
      detailStatusLabel: 'HT',
      cardStatusLabel: 'LIVE',
      scoreMode: 'score',
    });
  });

  it('represents a finished match consistently', () => {
    expect(deriveMatchPresentation({ status: 'FINISHED', kickOff: kickoff })).toMatchObject({
      phase: 'finished',
      detailStatusLabel: 'FT',
      cardStatusLabel: 'FT',
      scoreMode: 'score',
      status: { label: 'FT', tone: 'muted' },
      score: { kind: 'empty' },
      prediction: { kind: 'empty' },
    });
  });

  it('represents an awarded match as a settled result', () => {
    expect(
      deriveMatchPresentation({
        status: 'AWARDED',
        kickOff: kickoff,
        homeScore: 3,
        awayScore: 0,
      }),
    ).toMatchObject({
      phase: 'finished',
      canPredict: false,
      isFinished: true,
      detailStatusLabel: 'AWARDED',
      cardStatusLabel: 'AWARDED',
      scoreMode: 'score',
      status: { label: 'AWARDED', tone: 'muted' },
    });
  });

  it.each(['POSTPONED', 'CANCELLED'])('closes predictions for a future %s match', (status) => {
    expect(
      deriveMatchPresentation(
        { status, kickOff: kickoff, time: '20:30' },
        new Date('2026-08-15T17:00:00.000Z'),
      ),
    ).toMatchObject({
      phase: 'unavailable',
      canPredict: false,
      scoreMode: 'kickoff-time',
      status: { label: status },
    });
  });

  it('keeps a suspended score visible while predictions stay closed', () => {
    expect(
      deriveMatchPresentation({
        status: 'SUSPENDED',
        kickOff: kickoff,
        homeScore: 1,
        awayScore: 0,
      }),
    ).toMatchObject({
      phase: 'unavailable',
      canPredict: false,
      isLive: false,
      scoreMode: 'score',
      status: { label: 'SUSPENDED' },
    });
  });

  it('builds score, status, and prediction slots for a finished pick', () => {
    expect(
      deriveMatchPresentation({
        status: 'FINISHED',
        kickOff: kickoff,
        date: 'Sat, 15/8',
        time: '20:30',
        homeScore: 3,
        awayScore: 1,
        prediction: { home: 2, away: 1 },
        predictionStatus: 'correct',
      }),
    ).toMatchObject({
      status: { label: 'FT', tone: 'muted' },
      score: { kind: 'score', home: 3, away: 1, tone: 'muted' },
      prediction: { kind: 'value', text: '2-1', tone: 'success' },
    });
  });

  it('offers a plus slot while predictions are open', () => {
    expect(
      deriveMatchPresentation(
        { status: 'SCHEDULED', kickOff: kickoff, date: 'Sat, 15/8', time: '20:30' },
        new Date('2026-08-15T17:00:00.000Z'),
      ),
    ).toMatchObject({
      status: { label: 'Sat, 15/8', tone: 'default' },
      score: { kind: 'time', time: '20:30' },
      prediction: { kind: 'plus' },
    });
  });
});
