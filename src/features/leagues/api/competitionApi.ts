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
      .select('id, current_fixture, total_fixtures, type, current_stage, season_id')
      .eq('id', competitionId)
      .single();

    if (error) throw new Error(error.message);

    const allFixtures = Array.from({ length: data?.total_fixtures ?? 0 }, (_, i) => i + 1);
    const currentFixture = data?.current_fixture ?? 0;

    return {
      id: competitionId,
      allFixtures,
      currentFixture,
      totalFixtures: data?.total_fixtures ?? 0,
      type: data?.type,
      seasonId: data?.season_id ?? null,
    };
  },

  async getCompetitionFixtures(competitionId: number) {
    return competitionApi.getCompetitionsDetails(competitionId);
  },
};
