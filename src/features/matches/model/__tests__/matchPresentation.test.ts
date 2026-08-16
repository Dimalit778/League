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
  });

  it('represents a paused match as halftime', () => {
    expect(deriveMatchPresentation({ status: 'PAUSED', kickOff: kickoff })).toMatchObject({
      phase: 'halftime',
      detailStatusLabel: 'HT',
      cardStatusLabel: 'LIVE',
    });
  });

  it('represents a finished match consistently', () => {
    expect(deriveMatchPresentation({ status: 'FINISHED', kickOff: kickoff })).toMatchObject({
      phase: 'finished',
      detailStatusLabel: 'FT',
      cardStatusLabel: 'FT',
      showKickoffTime: false,
    });
  });
});
