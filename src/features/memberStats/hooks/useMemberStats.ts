
import { KEYS } from "@/lib/queryClient";
import { skipToken, useQuery } from "@tanstack/react-query";
import { memberStatsApi } from "../api/memberStatsApi";
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;

export const useMemberStats = (memberId?: string ) => {
    return useQuery({
      queryKey: memberId ? KEYS.members.stats(memberId) : (['members', 'stats', 'disabled'] as const),
      queryFn: memberId ? () => memberStatsApi.getMemberStats(memberId) : skipToken,
      staleTime: STALE_TIME,
      retry: RETRY_COUNT,
    });
  };
