import { supabase } from '@/lib/supabase';
import { FIRST_PHASE_STAGES } from '../../types/footballStages';
import { KNOCKOUT_STAGE_VALUES } from '../../utils/tournamentMatches';
import { matchesApi } from '../matchesService';

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

  describe('getFixtureMatchesWithMemberPrediction', () => {
    it('fetches matches for a fixture', async () => {
      const mockMatches = [{ id: 1 }, { id: 2 }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getFixtureMatchesWithMemberPrediction({
        fixture: 5,
        competitionId: 100,
        memberId: 'm1',
      });
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result).toEqual([
        { id: 1, predictions: [] },
        { id: 2, predictions: [] },
      ]);
    });

    it('keeps only the current member predictions on each match', async () => {
      const mockMatches = [
        {
          id: 1,
          predictions: [
            { id: 'p1', league_member_id: 'm1', home_score: 1, away_score: 0 },
            { id: 'p2', league_member_id: 'm2', home_score: 2, away_score: 1 },
          ],
        },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getFixtureMatchesWithMemberPrediction({
        fixture: 5,
        competitionId: 100,
        memberId: 'm1',
      });

      expect(result[0].predictions).toEqual([mockMatches[0].predictions[0]]);
    });

    it('fetches fixture matches with an optional stage filter', async () => {
      const mockMatches = [{ id: 1, stage: 'REGULAR_SEASON' }];
      const eq = jest.fn().mockReturnThis();
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq,
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getFixtureMatchesWithMemberPrediction({
        fixture: 3,
        competitionId: 100,
        memberId: 'm1',
        stage: 'REGULAR_SEASON',
      });

      expect(eq).toHaveBeenCalledWith('competition_id', 100);
      expect(eq).toHaveBeenCalledWith('fixture', 3);
      expect(eq).toHaveBeenCalledWith('stage', 'REGULAR_SEASON');
      expect(result).toEqual([{ id: 1, stage: 'REGULAR_SEASON', predictions: [] }]);
    });
  });

  describe('getCompetitionMatchesWithMemberPredictions', () => {
    it('fetches all competition matches for a member', async () => {
      const mockMatches = [
        { id: 1, stage: 'GROUP_STAGE' },
        { id: 2, stage: 'FINAL' },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getCompetitionMatchesWithMemberPredictions(100, 'm1');
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result).toEqual([
        { id: 1, stage: 'GROUP_STAGE', predictions: [] },
        { id: 2, stage: 'FINAL', predictions: [] },
      ]);
    });

    it('returns group matches even when the member has no prediction yet', async () => {
      const mockMatches = [{ id: 1, stage: 'GROUP_STAGE', group: 'A', predictions: [] }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
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
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: inFilter,
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getTournamentMatchesByView(100, 'm1', 'groups');

      expect(inFilter).toHaveBeenCalledWith('stage', [...FIRST_PHASE_STAGES]);
      expect(result).toEqual([{ id: 1, stage: 'GROUP_STAGE', predictions: [] }]);
    });

    it('fetches knockout matches when view is knockout', async () => {
      const mockMatches = [{ id: 2, stage: 'LAST_16' }];
      const inFilter = jest.fn().mockReturnThis();
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: inFilter,
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getTournamentMatchesByView(100, 'm1', 'knockout');

      expect(inFilter).toHaveBeenCalledWith('stage', KNOCKOUT_STAGE_VALUES);
      expect(result).toEqual([{ id: 2, stage: 'LAST_16', predictions: [] }]);
    });
  });

  describe('getMemberFinishedMatches', () => {
    it('returns empty array when no data', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await matchesApi.getMemberFinishedMatches('m1', 100);
      expect(result).toEqual([]);
    });

    it('fetches finished matches', async () => {
      const mockMatches = [{ id: 1, status: 'FINISHED' }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getMemberFinishedMatches('m1', 100);
      expect(result).toEqual([{ id: 1, status: 'FINISHED', predictions: [] }]);
    });
  });
});
