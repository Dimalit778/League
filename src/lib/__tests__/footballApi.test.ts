import { getMatchesByRound, getNumberOfRounds } from '../footballApi';

describe('footballApi', () => {
  it('returns the highest matchday value for the Premier League season', async () => {
    await expect(getNumberOfRounds()).resolves.toBe(38);
  });

  it('fetches matches for a specific round', async () => {
    const response = await getMatchesByRound('5');

    expect(response).toEqual({
      matches: [
        expect.objectContaining({
          id: 1,
          matchday: 5,
          homeTeam: expect.objectContaining({ name: 'Home United' }),
          awayTeam: expect.objectContaining({ name: 'Away City' }),
        }),
      ],
    });
  });
});
