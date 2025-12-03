import { supabase } from '@/lib/supabase';

export const competitionApi = {
  async getCompetitions() {
    const { data, error } = await supabase.from('competitions').select('*');
    if (error) throw new Error(error.message);
    return data;
  },
  async getCompetitionFixtures(competitionId: number) {
    const { data, error } = await supabase
      .from('competitions')
      .select('current_fixture, total_fixtures')
      .eq('id', competitionId)

      .single();
    if (error) throw new Error(error.message);

    const allFixtures = Array.from({ length: data?.total_fixtures ?? 0 }, (_, i) => i + 1);
    const currentFixture = data?.current_fixture ?? 0;
    return { id: competitionId, allFixtures, currentFixture, totalFixtures: data?.total_fixtures ?? 0 };
  },
};
