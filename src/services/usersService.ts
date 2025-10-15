import { supabase } from '@/lib/supabase';
import { TablesUpdate } from '@/types/database.types';

type UserUpdate = TablesUpdate<'users'>;

export const userService = {
  async getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!authData.user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserStats(userId: string) {
    let query = supabase
      .from('predictions')
      .select(
        `
        *,
        fixtures!inner(*)
      `
      )
      .eq('user_id', userId);

    const { data, error } = await query;

    if (error) throw error;

    const totalPredictions = data.length;
    const totalPoints = data.reduce(
      (sum, prediction) => sum + (prediction.points || 0),
      0
    );
    const correctPredictions = data.filter(
      (p) => p.points && p.points > 0
    ).length;
    const accuracy =
      totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    return {
      totalPredictions,
      totalPoints,
      correctPredictions,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  },
};
