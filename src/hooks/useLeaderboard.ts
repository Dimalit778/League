import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leaderboardService } from '@/services/leaderboardService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';

// Image cache for batch operations
const imageCache = new Map<string, string>();

const buildCacheKey = (path: string) => {
  const transform = JSON.stringify({
    width: 80,
    height: 80,
    resize: 'cover',
    quality: 80,
  });
  return `avatars:${path}:3600:${transform}`;
};

export const useGetLeaderboard = () => {
  const leagueId = useMemberStore((s) => s.member?.league_id);

  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      // Fetch leaderboard data first
      const rows = await leaderboardService.getLeagueLeaderboard(leagueId!);

      const paths = rows.map((r) => r.avatar_url).filter(Boolean) as string[];
      if (paths.length === 0) {
        return rows.map((r) => ({ ...r, imageUri: null as string | null }));
      }

      // Check cache first and separate cached vs uncached paths
      const cachedUrls = new Map<string, string | null>();
      const uncachedPaths: string[] = [];

      paths.forEach((path) => {
        const cacheKey = buildCacheKey(path);
        const cached = imageCache.get(cacheKey);
        if (cached) {
          cachedUrls.set(path, cached);
        } else {
          uncachedPaths.push(path);
        }
      });

      // Only fetch signed URLs for uncached paths
      let fetchedUrls = new Map<string, string | null>();
      if (uncachedPaths.length > 0) {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrls(uncachedPaths, 3600, {
            download: false,
            transform: { width: 80, height: 80, resize: 'cover', quality: 80 },
          } as any);

        if (error) throw error;

        // Store in cache and map
        data.forEach(({ path, signedUrl }) => {
          if (path) {
            const cacheKey = buildCacheKey(path);
            const url = signedUrl ?? null;
            fetchedUrls.set(path, url);
            if (url) {
              imageCache.set(cacheKey, url);
            }
          }
        });
      }

      // Merge cached and fetched URLs
      const allUrls = new Map([...cachedUrls, ...fetchedUrls]);

      return rows.map((r) => ({
        ...r,
        imageUri: r.avatar_url ? (allUrls.get(r.avatar_url) ?? null) : null,
      }));
    },
  });
};
