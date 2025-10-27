import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://api.football-data.org/v4';

export const handlers = [
  http.get(`${API_BASE_URL}/competitions/PL/matches`, ({ request }) => {
    const url = new URL(request.url);
    const matchday = url.searchParams.get('matchday');
    const stage = url.searchParams.get('stage');

    if (stage === 'REGULAR_SEASON') {
      return HttpResponse.json({
        matches: [
          { matchday: 1 },
          { matchday: 10 },
          { matchday: 38 },
        ],
      });
    }

    if (matchday) {
      return HttpResponse.json({
        matches: [
          {
            id: 1,
            matchday: Number(matchday),
            homeTeam: { name: 'Home United' },
            awayTeam: { name: 'Away City' },
          },
        ],
      });
    }

    return HttpResponse.json({ matches: [] });
  }),
];
