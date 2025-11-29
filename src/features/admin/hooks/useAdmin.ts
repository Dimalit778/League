import { KEYS } from '@/lib/queryClient';
import { TablesInsert } from '@/types/database.types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../queries/adminService';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: KEYS.admin.dashboard,
    queryFn: () => adminService.getDashboardCounts(),
    staleTime: 60 * 1000,
  });
};

export const useAdminUsers = (page = 0, limit = 50) => {
  return useQuery({
    queryKey: [...KEYS.admin.users, page, limit],
    queryFn: () => adminService.getUsers(page, limit),
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
  });
};

export const useAdminLeagueMembers = () => {
  return useQuery({
    queryKey: KEYS.admin.leagueMembers,
    queryFn: () => adminService.getLeagueMembers(),
  });
};

export const useAdminPredictions = () => {
  return useQuery({
    queryKey: KEYS.admin.predictions,
    queryFn: () => adminService.getPredictions(),
  });
};

export const useAdminCompetitions = () => {
  return useQuery({
    queryKey: KEYS.admin.competitions,
    queryFn: () => adminService.getCompetitions(),
  });
};

export const useAddCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competition: TablesInsert<'competitions'>) => adminService.addCompetition(competition),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEYS.admin.competitions,
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
