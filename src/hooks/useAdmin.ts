import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { adminService } from '@/services/adminService';
import { TablesInsert } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.dashboard,
    queryFn: () => adminService.getDashboardCounts(),
    staleTime: 60 * 1000,
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users,
    queryFn: () => adminService.getUsers(),
  });
};

export const useAdminLeagues = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.leagues,
    queryFn: () => adminService.getLeagues(),
  });
};

export const useAdminLeagueMembers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.leagueMembers,
    queryFn: () => adminService.getLeagueMembers(),
  });
};

export const useAdminPredictions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.predictions,
    queryFn: () => adminService.getPredictions(),
  });
};

export const useAdminCompetitions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.competitions,
    queryFn: () => adminService.getCompetitions(),
  });
};

export const useAddCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competition: TablesInsert<'competitions'>) =>
      adminService.addCompetition(competition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.competitions });
    },
  });
};

export const useRemoveCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competitionId: number) =>
      adminService.removeCompetition(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.competitions });
    },
  });
};
