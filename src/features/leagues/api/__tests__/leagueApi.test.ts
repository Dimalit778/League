import { supabase } from "@/lib/supabase";
import { leagueApi } from "../leagueApi";

describe("leagueApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getLeaderboardView", () => {
    it("fetches leaderboard for a league", async () => {
      const mockData = [{ member_id: "m1", total_points: 100 }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await leagueApi.getLeaderboardView("l1");
      expect(supabase.from).toHaveBeenCalledWith("league_leaderboard_view");
      expect(result).toEqual(mockData);
    });

    it("throws on error", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: "Error" } }),
      });

      await expect(leagueApi.getLeaderboardView("l1")).rejects.toEqual({
        message: "Error",
      });
    });
  });

  describe("getMyLeagues", () => {
    it("returns grouped leagues for a user", async () => {
      const mockData = [
        {
          id: "m1",
          is_primary: true,
          active: true,
          league: { id: "l1", name: "Primary" },
        },
        {
          id: "m2",
          is_primary: false,
          active: true,
          league: { id: "l2", name: "Active" },
        },
        {
          id: "m3",
          is_primary: false,
          active: false,
          league: { id: "l3", name: "Inactive" },
        },
      ];
      const order = jest.fn().mockReturnThis();
      order.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order,
      });
      order.mockResolvedValueOnce({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order,
      });

      const result = await leagueApi.getMyLeagues("u1");
      expect(supabase.from).toHaveBeenCalledWith("league_members");
      expect(result).toEqual({
        primaryLeague: mockData[0],
        leagues: [mockData[1]],
        inactiveLeagues: [mockData[2]],
        totalLeagues: 3,
      });
    });
  });

  describe("createLeague", () => {
    it("calls rpc with correct params", async () => {
      const mockRpc = jest.fn().mockResolvedValue({ data: "l1", error: null });
      (supabase as any).rpc = mockRpc;

      const result = await leagueApi.createLeague({
        league_name: "Test",
        max_members: 6,
        competition_id: 1,
        nickname: "Player1",
      });

      expect(mockRpc).toHaveBeenCalledWith("create_new_league", {
        league_name: "Test",
        max_members: 6,
        competition_id: 1,
        nickname: "Player1",
      });
      expect(result).toBe("l1");
    });
  });

  describe("joinLeague", () => {
    it("calls rpc with join code and nickname", async () => {
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: "member-id", error: null });
      (supabase as any).rpc = mockRpc;

      const result = await leagueApi.joinLeague("ABC1234", "TestUser");
      expect(mockRpc).toHaveBeenCalledWith("join_league", {
        league_join_code: "ABC1234",
        user_nickname: "TestUser",
      });
      expect(result).toBe("member-id");
    });

    it("throws when no data returned", async () => {
      const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase as any).rpc = mockRpc;

      await expect(leagueApi.joinLeague("ABC1234", "TestUser")).rejects.toThrow(
        "Failed to join league",
      );
    });
  });

  describe("updatePrimaryLeague", () => {
    it("uses the atomic set_primary_league rpc", async () => {
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: { success: true }, error: null });
      (supabase as any).rpc = mockRpc;

      const result = await leagueApi.updatePrimaryLeague("l1");

      expect(mockRpc).toHaveBeenCalledWith("set_primary_league", {
        p_league_id: "l1",
      });
      expect(result).toEqual({ success: true });
    });

    it("throws on rpc error", async () => {
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "No membership" } });
      (supabase as any).rpc = mockRpc;

      await expect(leagueApi.updatePrimaryLeague("l1")).rejects.toThrow(
        "No membership",
      );
    });
  });

  describe("deleteLeague", () => {
    it("uses the atomic delete_owned_league rpc", async () => {
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: { success: true }, error: null });
      (supabase as any).rpc = mockRpc;

      const result = await leagueApi.deleteLeague("l1");

      expect(mockRpc).toHaveBeenCalledWith("delete_owned_league", {
        p_league_id: "l1",
      });
      expect(result).toEqual({ success: true });
    });

    it("throws on rpc error", async () => {
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Not owner" } });
      (supabase as any).rpc = mockRpc;

      await expect(leagueApi.deleteLeague("l1")).rejects.toThrow("Not owner");
    });
  });

  describe("findLeagueByJoinCode", () => {
    it("finds a league by code", async () => {
      const mockLeague = { league_id: "l1", league_name: "Found League" };
      const mockRpc = jest
        .fn()
        .mockResolvedValue({ data: [mockLeague], error: null });
      (supabase as any).rpc = mockRpc;

      const result = await leagueApi.findLeagueByJoinCode("ABC1234");
      expect(result).toEqual(mockLeague);
    });

    it("throws when league not found", async () => {
      const mockRpc = jest.fn().mockResolvedValue({ data: [], error: null });
      (supabase as any).rpc = mockRpc;

      await expect(leagueApi.findLeagueByJoinCode("INVALID")).rejects.toThrow(
        "League not found",
      );
    });
  });

  describe("updateLeague", () => {
    it("updates league name", async () => {
      const mockUpdated = { id: "l1", name: "New Name" };
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      });

      const result = await leagueApi.updateLeague("l1", { name: "New Name" });
      expect(supabase.from).toHaveBeenCalledWith("leagues");
      expect(result).toEqual(mockUpdated);
    });
  });
});
