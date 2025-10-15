import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leaderboardService } from '@/services/leaderboardService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';

export const useGetLeagueLeaderboard = () => {
  const leagueId = useMemberStore((s) => s.member?.league_id);

  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    queryFn: () => leaderboardService.getLeagueLeaderboard(leagueId!),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
  });
};
export const useLeaderboardWithAvatars = () => {
  const base = useGetLeagueLeaderboard();
  const { data: rows } = base;

  return useQuery({
    queryKey: ['leaderboard-with-avatars', rows],
    enabled: !!rows,
    queryFn: async () => {
      const items = rows ?? [];
      const paths = items.map((r) => r.avatar_url).filter(Boolean) as string[];
      if (paths.length === 0) {
        return items.map((r) => ({ ...r, avatarUri: null as string | null }));
      }

      const options = {
        download: false,
        transform: { width: 80, height: 80, resize: 'cover', quality: 80 },
      } as any;

      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrls(paths, 3600, options);
      if (error) throw error;

      const byPath = new Map<string, string | null>();
      data.forEach(({ path, signedUrl }) => {
        if (path) byPath.set(path, signedUrl ?? null);
      });

      return items.map((r) => ({
        ...r,
        avatarUri: r.avatar_url ? (byPath.get(r.avatar_url) ?? null) : null,
      }));
    },
    staleTime: 60_000,
  });
};
