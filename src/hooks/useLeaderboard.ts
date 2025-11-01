import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leaderboardService } from '@/services/leaderboardService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';

export const useGetLeaderboard = () => {
  const leagueId = useMemberStore((s) => s.member?.league_id);

  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const rows = await leaderboardService.getLeagueLeaderboard(leagueId!);

      const paths = rows.map((r) => r.avatar_url).filter(Boolean) as string[];
      if (paths.length === 0) {
        return rows.map((r) => ({ ...r, imageUri: null as string | null }));
      }

      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrls(paths, 3600, {
          download: false,
          transform: { width: 80, height: 80, resize: 'cover', quality: 80 },
        } as any);

      if (error) throw error;

      const byPath = new Map<string, string | null>();
      data.forEach(({ path, signedUrl }) => {
        if (path) byPath.set(path, signedUrl ?? null);
      });

      return rows.map((r) => ({
        ...r,
        imageUri: r.avatar_url ? (byPath.get(r.avatar_url) ?? null) : null,
      }));
    },
  });
};
