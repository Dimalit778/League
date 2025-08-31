  
import { QUERY_KEYS } from '@/lib/queryKeys';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';
import { MemberStatsType } from '@/types';
import { useQuery } from '@tanstack/react-query';


export const useMemberStats = () => {
  const { member } = useMemberStore();

  const fetchMemberStats = async (): Promise<MemberStatsType> => {
    if (!member?.id) {
      throw new Error('No member ID available');
    }

    const { data, error } = await supabase
      .from('predictions')
      .select('points, is_finished')
      .eq('league_member_id', member.id)
      .eq('is_finished', true)


    if (error) throw error;

    const totalPredictions = data.length;
    const totalPoints = data.reduce((sum, prediction) => sum + (prediction.points || 0), 0);
    

    const bingoHits = data.filter(p => p.points === 3).length;

    const regularHits = data.filter(p => p.points === 1).length;
    
  
    const missedHits = data.filter(p => p.points === 0).length;
    
    const accuracy = totalPredictions > 0 
      ? ((bingoHits + regularHits) / totalPredictions) * 100 
      : 0;

    return {
      totalPredictions,
      bingoHits,
      regularHits,
      missedHits,
      totalPoints,
      accuracy: Math.round(accuracy * 100) / 100
    };
  };

  return useQuery({
    queryKey: QUERY_KEYS.memberStats(member?.id || ''),
    queryFn: fetchMemberStats,
    enabled: !!member?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
