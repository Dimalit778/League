const football_key = 'e44e55e51d5242b8b5d8ac92af329d46';
const api_url = 'https://api.football-data.org/v4';

export const getNumberOfRounds = async () => {
  const response = await fetch(
    `${api_url}/competitions/PL/matches?season=2025&stage=REGULAR_SEASON&limit=500`,
    {
      headers: {
        'X-Auth-Token': football_key,
      },
    }
  );
  if (!response) {
    throw new Error('No response from API');
  }
  const data = await response.json();
  const total_matchdays = Math.max(
    ...data.matches.map((match: { matchday: number }) => match.matchday)
  );
  console.log('total_matchdays', total_matchdays);
  return total_matchdays;
};
export const getMatchesByRound = async (round: string) => {
  const response = await fetch(
    `${api_url}/competitions/PL/matches?matchday=${round}`,
    {
      headers: {
        'X-Auth-Token': football_key,
      },
    }
  );
  if (!response) {
    throw new Error('No response from API');
  }
  const data = await response.json();
  return data;
};
