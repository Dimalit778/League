import { memberApi } from "@/features/members/api/memberApi";
import { KEYS } from "@/lib/queryClient";
import { skipToken, useQuery } from "@tanstack/react-query";
import { memberStatsApi } from "../api/memberStatsApi";
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;

export const useMemberStats = (memberId: string) => {
    return useQuery({
      queryKey: memberId ? KEYS.members.stats(memberId) : (['members', 'stats', 'disabled'] as const),
      queryFn: memberId ? () => memberStatsApi.getMemberStats(memberId) : skipToken,
      staleTime: STALE_TIME,
      retry: RETRY_COUNT,
    });
  };
  export const useMemberDataAndStats = (memberId: string) => {
    const memberQuery = useQuery({
      queryKey: memberId ? KEYS.members.detailsWithStats(memberId) : (['members', 'details-with-stats', 'disabled'] as const),
      queryFn: memberId ? () => memberApi.getMemberInfo(memberId) : skipToken,
      staleTime: STALE_TIME,
      retry: RETRY_COUNT,
    });
  
    const statsQuery = useMemberStats(memberId);
  
    const totalFixtures = Array.from(
      { length: memberQuery.data?.league?.competition?.current_fixture ?? 0 },
      (_, index) => index + 1,
    );
  
    return {
      ...memberQuery,
      isLoading: memberQuery.isLoading || statsQuery.isLoading,
      isPending: memberQuery.isPending || statsQuery.isPending,
      error: memberQuery.error ?? statsQuery.error,
      data:
        memberQuery.data != null
          ? {
              member: memberQuery.data,
              stats: statsQuery.data,
              totalFixtures,
              currentFixture: memberQuery.data.league?.competition?.current_fixture ?? 1,
            }
          : undefined,
    };
  };  