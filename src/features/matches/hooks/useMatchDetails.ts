import { supabase } from "@/lib/supabase/supabase";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useQuery } from "@tanstack/react-query";
import { MatchDetails } from "../types/fixtures.types";

    export const useMatchDetails = (fixtureId: number, leagueId: string) => {
    return useQuery({
      queryKey: queryKeys.matchDetails(fixtureId, leagueId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('fixtures')
          .select(`
            *,
            home_team:teams!fixtures_home_team_id_fkey(name, logo),
            away_team:teams!fixtures_away_team_id_fkey(name, logo),
            predictions!inner(
              home_goals_prediction,
              away_goals_prediction,
              points_earned,
              league_members!inner(nickname, avatar_url)
            )
          `)
          .eq('id', fixtureId)
          .eq('predictions.league_id', leagueId)
          .single();
        
        if (error) throw error;
        
        // Check if predictions are still open for this round
        const canPredict = await checkCanPredictRound(
          data.competition_id, 
          data.season, 
          data.round    
        );
        
        return {
          ...data,
          home_team_name: data.home_team?.name,
          home_team_logo: data.home_team?.logo,
          away_team_name: data.away_team?.name,
          away_team_logo: data.away_team?.logo,
          can_predict: canPredict,
          predictions: data.predictions.map(p => ({
            nickname: p.league_members?.nickname,
            avatar_url: p.league_members?.avatar_url,
            home_goals_prediction: p.home_goals_prediction,
            away_goals_prediction: p.away_goals_prediction,
            points_earned: p.points_earned,
          })).sort((a, b) => b.points_earned - a.points_earned),
        } as MatchDetails;
      },
      enabled: !!fixtureId && !!leagueId,
    });
  };