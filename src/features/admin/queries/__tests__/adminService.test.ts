/* eslint-disable @typescript-eslint/no-require-imports */
import { supabase } from '@/lib/supabase';

// Re-import after supabase mock is set up
const { adminService } = require('../adminService');

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('calls supabase with correct table and pagination', async () => {
      const mockData = [{ id: 'u1', email: 'test@test.com' }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await adminService.getUsers(0, 50);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: null, error: { message: 'Failed' } }),
      });

      await expect(adminService.getUsers()).rejects.toEqual({ message: 'Failed' });
    });
  });

  describe('deleteUser', () => {
    it('calls supabase delete on users table', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await adminService.deleteUser('u1');
      expect(supabase.from).toHaveBeenCalledWith('users');
    });
  });

  describe('getCompetitions', () => {
    it('fetches competitions ordered by date', async () => {
      const mockData = [{ id: 1, name: 'Premier League' }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await adminService.getCompetitions();
      expect(supabase.from).toHaveBeenCalledWith('competitions');
      expect(result).toEqual(mockData);
    });
  });

  describe('addCompetition', () => {
    it('inserts a competition', async () => {
      const mockComp = { id: 1, name: 'La Liga' };
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockComp, error: null }),
          }),
        }),
      });

      const result = await adminService.addCompetition({ name: 'La Liga' });
      expect(supabase.from).toHaveBeenCalledWith('competitions');
      expect(result).toEqual(mockComp);
    });
  });

  describe('removeCompetition', () => {
    it('deletes a competition by id', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await adminService.removeCompetition(1);
      expect(supabase.from).toHaveBeenCalledWith('competitions');
    });
  });

  describe('content moderation', () => {
    it('loads the selected report queue', async () => {
      const mockData = [{ id: 'r1', status: 'pending' }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await adminService.getContentReports('pending');

      expect(supabase.from).toHaveBeenCalledWith('content_reports');
      expect(result).toEqual(mockData);
    });

    it('moderates a report through the admin rpc', async () => {
      const mockRpc = jest.fn().mockResolvedValue({ data: { success: true }, error: null });
      (supabase as any).rpc = mockRpc;

      await adminService.moderateContentReport('r1', 'remove_content');

      expect(mockRpc).toHaveBeenCalledWith('moderate_content_report', {
        p_report_id: 'r1',
        p_decision: 'remove_content',
      });
    });
  });
});
