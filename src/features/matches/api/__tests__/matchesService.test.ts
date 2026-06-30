import { supabase } from '@/lib/supabase';
import { FIRST_PHASE_STAGES } from '../../types/footballStages';
import { KNOCKOUT_STAGE_VALUES } from '../../utils/tournamentMatches';
import { matchesApi } from '../matchesService';

const mockPredictionsQuery = (predictions: unknown[] = []) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockResolvedValue({ data: predictions, error: null }),
});

const mockMatchesQuery = (matches: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: matches, error: null }),
});

describe('matchesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMatchWithPredictions', () => {
    it('fetches match with predictions', async () => {
      const mockMatch = {
        id: 1,
        home_team: {},
        away_team: {},
        predictions: [],
      };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockMatch, error: null }),
      });

      const result = await matchesApi.getMatchWithPredictions('l1', 1);
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result).toEqual(mockMatch);
    });

    it('throws when match not found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      await expect(matchesApi.getMatchWithPredictions('l1', 999)).rejects.toThrow('Match not found');
    });
  });

  describe('getMatchesByFixture', () => {
    const baseMatchRow = {
      competition_id: 100,
      fixture: 5,
      kick_off: '2026-05-23T19:00:00+00:00',
      status: 'SCHEDULED',
      stage: null,
      group: null,
      home_team_id: 1,
      away_team_id: 2,
      score: null,
      ai_summary_en: null,
      ai_summary_he: null,
      ai_predicted_home_score: null,
      ai_predicted_away_score: null,
      home_team: null,
      away_team: null,
      predictions: [],
    };

    it('fetches matches for a fixture', async () => {
      const mockMatches = [
        { ...baseMatchRow, id: 1 },
        { ...baseMatchRow, id: 2 },
      ];
      (supabase.from as jest.Mock).mockReturnValue(mockMatchesQuery(mockMatches));

      const result = await matchesApi.getMatchesByFixture({
        fixture: 5,
        competitionId: 100,
        memberId: 'm1',
      });
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 1, prediction: null });
      expect(result[1]).toMatchObject({ id: 2, prediction: null });
    });

    it('keeps only the current member predictions on each match', async () => {
      const memberPrediction = {
        id: 'pred-1',
        match_id: 1,
        league_member_id: 'm1',
        home_score: 1,
        away_score: 0,
        points: 0,
        is_finished: false,
      };
      const mockMatches = [{ ...baseMatchRow, id: 1, predictions: [memberPrediction] }];
      (supabase.from as jest.Mock).mockReturnValue(mockMatchesQuery(mockMatches));

      const result = await matchesApi.getMatchesByFixture({
        fixture: 5,
        competitionId: 100,
        memberId: 'm1',
      });

      expect(result[0].prediction).toEqual(memberPrediction);
    });

    it('fetches fixture matches with an optional stage filter', async () => {
      const mockMatches = [{ ...baseMatchRow, id: 1, stage: 'REGULAR_SEASON' }];
      const eq = jest.fn().mockReturnThis();
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq,
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getMatchesByFixture({
        fixture: 3,
        competitionId: 100,
        memberId: 'm1',
        stage: 'REGULAR_SEASON',
      });

      expect(eq).toHaveBeenCalledWith('competition_id', 100);
      expect(eq).toHaveBeenCalledWith('fixture', 3);
      expect(eq).toHaveBeenCalledWith('predictions.league_member_id', 'm1');
      expect(eq).toHaveBeenCalledWith('stage', 'REGULAR_SEASON');
      expect(result[0]).toMatchObject({ id: 1, stage: 'REGULAR_SEASON', prediction: null });
    });
  });

  describe('getCompetitionMatchesWithMemberPredictions', () => {
    it('fetches all competition matches for a member', async () => {
      const mockMatches = [
        { id: 1, stage: 'GROUP_STAGE' },
        { id: 2, stage: 'FINAL' },
      ];
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return mockMatchesQuery(mockMatches);
      });

      const result = await matchesApi.getCompetitionMatchesWithMemberPredictions(100, 'm1');
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result[0]).toMatchObject({ id: 1, stage: 'GROUP_STAGE', prediction: null });
      expect(result[1]).toMatchObject({ id: 2, stage: 'FINAL', prediction: null });
    });

    it('returns group matches even when the member has no prediction yet', async () => {
      const mockMatches = [{ id: 1, stage: 'GROUP_STAGE', group: 'A' }];
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return mockMatchesQuery(mockMatches);
      });

      const result = await matchesApi.getCompetitionMatchesWithMemberPredictions(100, 'm1');

      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('A');
    });
  });

  describe('getTournamentMatchesByView', () => {
    it('fetches group stage matches when view is groups', async () => {
      const mockMatches = [{ id: 1, stage: 'GROUP_STAGE' }];
      const inFilter = jest.fn().mockReturnThis();
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: inFilter,
          order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
        };
      });

      const result = await matchesApi.getTournamentMatchesByView(100, 'm1', 'groups');

      expect(inFilter).toHaveBeenCalledWith('stage', [...FIRST_PHASE_STAGES]);
      expect(result[0]).toMatchObject({ id: 1, stage: 'GROUP_STAGE', prediction: null });
    });

    it('fetches knockout matches when view is knockout', async () => {
      const mockMatches = [{ id: 2, stage: 'LAST_16' }];
      const inFilter = jest.fn().mockReturnThis();
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: inFilter,
          order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
        };
      });

      const result = await matchesApi.getTournamentMatchesByView(100, 'm1', 'knockout');

      expect(inFilter).toHaveBeenCalledWith('stage', KNOCKOUT_STAGE_VALUES);
      expect(result[0]).toMatchObject({ id: 2, stage: 'LAST_16', prediction: null });
    });
  });

  describe('getMemberFinishedMatches', () => {
    it('returns empty array when no data', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return mockMatchesQuery([]);
      });

      const result = await matchesApi.getMemberFinishedMatches('m1', 100, 1);
      expect(result).toEqual([]);
    });

    it('fetches finished matches for a fixture', async () => {
      const mockMatches = [{ id: 1, status: 'FINISHED' }];
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'predictions') return mockPredictionsQuery();
        return mockMatchesQuery(mockMatches);
      });

      const result = await matchesApi.getMemberFinishedMatches('m1', 100, 2);
      expect(result[0]).toMatchObject({ id: 1, status: 'FINISHED', prediction: null });
    });
  });

  describe('getFinishedFixtures', () => {
    it('returns unique sorted fixture numbers', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ fixture: 2 }, { fixture: 1 }, { fixture: 2 }],
          error: null,
        }),
      });

      const result = await matchesApi.getFinishedFixtures(100);
      expect(result).toEqual([1, 2]);
    });
  });
});
