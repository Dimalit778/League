import { getMatchMinute } from '../matchTimer';

const KICKOFF = '2026-08-15T18:00:00.000Z';
const at = (minutesAfterKickoff: number) =>
  new Date(new Date(KICKOFF).getTime() + minutesAfterKickoff * 60_000);

describe('getMatchMinute', () => {
  it('returns HT for a paused match', () => {
    expect(getMatchMinute({ status: 'PAUSED', kickoffAt: KICKOFF }, at(50))).toBe('HT');
  });

  it('returns FT for a finished match', () => {
    expect(getMatchMinute({ status: 'FINISHED', kickoffAt: KICKOFF }, at(120))).toBe('FT');
  });

  it('returns empty string for a non-live match', () => {
    expect(getMatchMinute({ status: 'SCHEDULED', kickoffAt: KICKOFF }, at(-10))).toBe('');
  });

  it('counts up during the first half', () => {
    expect(getMatchMinute({ status: 'IN_PLAY', kickoffAt: KICKOFF }, at(20))).toBe("20'");
  });

  it('never shows below 1 minute while live', () => {
    expect(getMatchMinute({ status: 'IN_PLAY', kickoffAt: KICKOFF }, at(0))).toBe("1'");
  });

  it('clamps to 45 through the first-half stoppage and break window', () => {
    expect(getMatchMinute({ status: 'IN_PLAY', kickoffAt: KICKOFF }, at(52))).toBe("45'");
  });

  it('keeps advancing in the second half instead of freezing at 45 (no second-half timestamp)', () => {
    // 70 real minutes after kick-off ≈ 55' of play once the ~15' break is removed.
    expect(getMatchMinute({ status: 'IN_PLAY', kickoffAt: KICKOFF }, at(70))).toBe("55'");
  });

  it('uses the exact second-half start when provided', () => {
    const secondHalfStartedAt = at(61).toISOString();
    // 10 minutes into the second half → 55'.
    expect(
      getMatchMinute({ status: 'IN_PLAY', kickoffAt: KICKOFF, secondHalfStartedAt }, at(71)),
    ).toBe("55'");
  });

  it('handles extra time as a live status', () => {
    expect(getMatchMinute({ status: 'EXTRA_TIME', kickoffAt: KICKOFF }, at(105))).toBe("90'");
  });
});
