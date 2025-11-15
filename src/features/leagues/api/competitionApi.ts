import { supabase } from '@/lib/supabase';

export const competitionApi = {
  async getCompetitions() {
    const { data, error } = await supabase.from('competitions').select('*');
    if (error) throw new Error(error.message);
    return data;
  },
};
