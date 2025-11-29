import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const usePrimaryMember = (userId: string) => {
  return useQuery({
    queryKey: KEYS.members.primary(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from('league_members') // ← Database query
        .select('*, league:leagues!league_id(id, competition_id)')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
};
