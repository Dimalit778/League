import { supabase } from '@/lib/supabase';
import { MemberStatsType } from '@/types';

export const membersService = {
  // Get Member Stats
  async getMemberStats(memberId: string): Promise<MemberStatsType> {
    if (!memberId) {
      throw new Error('No member ID available');
    }

    const { data, error } = await supabase
      .from('predictions')
      .select('points, is_finished')
      .eq('league_member_id', memberId)
      .eq('is_finished', true);

    if (error) throw error;

    const totalPredictions = data.length;
    const totalPoints = data.reduce(
      (sum, prediction) => sum + (prediction.points || 0),
      0
    );

    const bingoHits = data.filter((p) => p.points === 3).length;

    const regularHits = data.filter((p) => p.points === 1).length;

    const missedHits = data.filter((p) => p.points === 0).length;

    const accuracy =
      totalPredictions > 0
        ? ((bingoHits + regularHits) / totalPredictions) * 100
        : 0;

    return {
      totalPredictions,
      bingoHits,
      regularHits,
      missedHits,
      totalPoints,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  },
  // Upload Member Image
  async uploadMemberImage(memberId: string, avatarUrl: string) {
    const { data, error } = await supabase
      .from('league_members')
      .update({ avatar_url: avatarUrl })
      .eq('id', memberId)
      .select()
      .single();
  },
  // Delete Member Image
  async deleteMemberImage(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .update({ avatar_url: null })
      .eq('id', memberId)
      .select()
      .single();
  },
  // Get Member Image
  async getMemberImage(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('avatar_url')
      .eq('id', memberId)
      .single();
  },
};
