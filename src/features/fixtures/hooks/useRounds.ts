import { supabase } from "@/lib/supabase/supabase";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useQuery } from "@tanstack/react-query";

export const useRounds = (competitionId?: number, season?: number) => {
    return useQuery({
      queryKey: queryKeys.rounds(competitionId!, season!),
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_rounds_with_status', {
          comp_id: competitionId,
          season_year: season,
        });
        
        if (error) throw error;
        return data as RoundInfo[];
      },
      enabled: !!competitionId && !!season,
    });
  };
  