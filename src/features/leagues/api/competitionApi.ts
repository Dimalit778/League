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
      .select('id, code, current_matchday, total_matchdays, type, current_stage, season_id')
      .eq('id', competitionId)
      .single();

    if (error) throw new Error(error.message);

    const totalMatchdays = data?.total_matchdays ?? 0;
    const allMatchdays = Array.from({ length: totalMatchdays }, (_, i) => i + 1);
    const currentMatchday = data?.current_matchday ?? 0;

    return {
      id: competitionId,
      code: data?.code ?? null,
      allMatchdays,
      currentMatchday,
      totalMatchdays,
      type: data?.type,
      currentStage: data?.current_stage ?? null,
      seasonId: data?.season_id ?? null,
    };
  },


};
