import { ModerationDecision, ReportStatus } from '@/features/moderation/types';
import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { CreateCompetitionInput } from '../queries/adminService';
import { skipToken, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../queries/adminService';

const ADMIN_STALE_TIME = 60 * 1000; // 1 minute

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: KEYS.admin.dashboard,
    queryFn: () => adminService.getDashboardCounts(),
    staleTime: ADMIN_STALE_TIME,
  });
};
export const useIsAdmin = () => {
  const userId = useAuthStore((state) => state.session?.user.id ?? null);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const isReady = !isAuthLoading && userId != null;

  return useQuery({
    queryKey: KEYS.admin.isAdmin(userId),
    queryFn: isReady ? () => adminService.isAdmin() : skipToken,
    enabled: isReady,
    staleTime: ADMIN_STALE_TIME,
  });
};
export const useAdminUsersInfinite = () => {
  return useInfiniteQuery({
    queryKey: KEYS.admin.users,
    queryFn: ({ pageParam = 0 }) => adminService.getUsers(pageParam, 50),
    getNextPageParam: (lastPage, allPages) => {
      // If we got less than 50 users, we've reached the end
      return lastPage.length === 50 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export const useAdminLeagues = () => {
  return useQuery({
    queryKey: KEYS.admin.leagues,
    queryFn: () => adminService.getLeagues(),
    staleTime: ADMIN_STALE_TIME,
  });
};

export const useAdminLeagueMembers = () => {
  return useQuery({
    queryKey: KEYS.admin.leagueMembers,
    queryFn: () => adminService.getLeagueMembers(),
    staleTime: ADMIN_STALE_TIME,
  });
};

export const useAdminPredictions = () => {
  return useQuery({
    queryKey: KEYS.admin.predictions,
    queryFn: () => adminService.getPredictions(),
    staleTime: ADMIN_STALE_TIME,
  });
};

export const useAdminCompetitions = () => {
  return useQuery({
    queryKey: KEYS.admin.competitions,
    queryFn: () => adminService.getCompetitions(),
    staleTime: ADMIN_STALE_TIME,
  });
};

export const useAdminContentReports = (status: ReportStatus) =>
  useQuery({
    queryKey: KEYS.admin.reports(status),
    queryFn: () => adminService.getContentReports(status),
    staleTime: ADMIN_STALE_TIME,
  });

export const useModerateContentReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, decision }: { reportId: string; decision: ModerationDecision }) =>
      adminService.moderateContentReport(reportId, decision),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: KEYS.admin.dashboard }),
        queryClient.invalidateQueries({ queryKey: KEYS.admin.reports('pending') }),
        queryClient.invalidateQueries({ queryKey: KEYS.admin.reports('resolved') }),
        queryClient.invalidateQueries({ queryKey: KEYS.admin.reports('dismissed') }),
        queryClient.invalidateQueries({ queryKey: KEYS.members.all }),
        queryClient.invalidateQueries({ queryKey: KEYS.leagues.all }),
      ]),
  });
};

export const useAddCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competition: CreateCompetitionInput) => adminService.addCompetition(competition),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEYS.admin.competitions,
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.competitions.all,
      });
    },
  });
};

export const useRemoveCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competitionId: number) => adminService.removeCompetition(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEYS.admin.competitions,
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.competitions.all,
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEYS.admin.users,
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.admin.dashboard,
      });
    },
  });
};
