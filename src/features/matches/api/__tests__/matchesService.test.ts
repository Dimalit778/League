import { supabase } from '@/lib/supabase';
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

  describe('getMatchesByFixtureWithMemberPredictions', () => {
    it('fetches matches for a fixture', async () => {
      const mockMatches = [{ id: 1 }, { id: 2 }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMatches, error: null }),
      });

      const result = await matchesApi.getMatchesByFixtureWithMemberPredictions(5, 100, 'm1');
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(result).toEqual(mockMatches);
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
      expect(result).toEqual(mockMatches);
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
      expect(result).toEqual(mockMatches);
    });
  });

  describe('getTournamentMatchesWithMemberPredictions', () => {
    it('splits first phase and knockout stages', async () => {
      const mockRows = [
        { id: 1, stage: 'GROUP_STAGE', kick_off: '2026-06-01T12:00:00Z' },
        { id: 2, stage: 'FINAL', kick_off: '2026-06-15T12:00:00Z' },
        { id: 3, stage: 'LEAGUE_STAGE', kick_off: '2026-06-02T12:00:00Z' },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRows, error: null }),
      });

      const result = await matchesApi.getTournamentMatchesWithMemberPredictions(100, 'm1');
      expect(result).toEqual({
        firstPhase: [
          { id: 1, stage: 'GROUP_STAGE', kick_off: '2026-06-01T12:00:00Z' },
          { id: 3, stage: 'LEAGUE_STAGE', kick_off: '2026-06-02T12:00:00Z' },
        ],
        knockoutStages: [{ id: 2, stage: 'FINAL', kick_off: '2026-06-15T12:00:00Z' }],
      });
    });

    it('returns empty buckets when no data', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await matchesApi.getTournamentMatchesWithMemberPredictions(100, 'm1');
      expect(result).toEqual({ firstPhase: [], knockoutStages: [] });
    });
  });
});
