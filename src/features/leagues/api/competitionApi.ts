import { supabase } from '@/lib/supabase';

export const competitionApi = {
  async getCompetitions() {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('is_free', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    return data ?? [];
  },

  async getCompetitionsDetails(competitionId: number) {
    const { data, error } = await supabase
      .from('competitions')
      .select(`
        id,
        code,
        type,
        seasons(
          id,
          current_matchday,
          current_stage,
          total_matchdays,
          is_current
        )
      `)
      .eq('id', competitionId)
      .single();

    if (error) throw new Error(error.message);

    const currentSeason = data?.seasons?.find((season) => season.is_current) ?? null;
    const totalMatchdays = currentSeason?.total_matchdays ?? 0;
    const allMatchdays = Array.from({ length: totalMatchdays }, (_, i) => i + 1);
    const currentMatchday = currentSeason?.current_matchday ?? 0;

    return {
      id: competitionId,
      code: data?.code ?? null,
      allMatchdays,
      currentMatchday,
      totalMatchdays,
      type: data?.type,
      currentStage: currentSeason?.current_stage ?? null,
      seasonId: currentSeason?.id ?? null,
    };
  },


};
