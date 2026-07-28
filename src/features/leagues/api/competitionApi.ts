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
      .select('id, code, current_fixture, total_fixtures, type, current_stage, season_id')
      .eq('id', competitionId)
      .single();

    if (error) throw new Error(error.message);

    const allFixtures = Array.from({ length: data?.total_fixtures ?? 0 }, (_, i) => i + 1);
    const currentFixture = data?.current_fixture ?? 0;

    return {
      id: competitionId,
      code: data?.code ?? null,
      allFixtures,
      currentFixture,
      totalFixtures: data?.total_fixtures ?? 0,
      type: data?.type,
      currentStage: data?.current_stage ?? null,
      seasonId: data?.season_id ?? null,
    };
  },


};
