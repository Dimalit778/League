import { supabase } from "@/lib/supabase/supabase";

export  const checkCanPredictRound = async (
    competitionId: number, 
    season: number, 
    round: string
  ): Promise<boolean> => {
    const { data, error } = await supabase.rpc('can_predict_round', {
      comp_id: competitionId,
      season_year: season,
      round_name: round,
    });
    
    if (error) return false;
    return data;
  };