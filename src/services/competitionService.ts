import { supabase } from "@/lib/supabase";

interface RoundsData {
    rounds: string[]
    synced_at: string
    total_rounds: number
  }
export const competitionService = {
    async getCompetitions() {
        const { data, error } = await supabase.from("competitions").select("*");
        if (error)  throw new Error(error.message)
        return data
    },
    async getCompetitionRounds(competitionId: number) {
        const { data, error } = await supabase
        .from("competitions")
        .select("id, name, current_round ,rounds_data")
        .eq("id", competitionId)
        .single();
        
        if (error) throw error;
        
        const roundsData = data.rounds_data as unknown as RoundsData;
        
        return {
          id: data.id,
          name: data.name,
          current_round: data.current_round,
          rounds: roundsData.rounds || [],
          total_rounds: roundsData.total_rounds || 0,
          synced_at: roundsData.synced_at
        };
    },
};