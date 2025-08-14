import { supabase } from "@/lib/supabase/supabase";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { Fixture } from "../types/fixtures.types";



export const useFixtures = (
    competitionId?: number, 
    season?: number, 
    round?: string,
    leagueId?: string
  ) => {
    const { user } = useAppStore();
    
    return useQuery({
      queryKey: queryKeys.fixtures(competitionId!, season!, round),
      queryFn: async () => {
        let query = supabase
          .from('fixtures')
          .select(`
            *,
            home_team:teams!fixtures_home_team_id_fkey(name, logo),
            away_team:teams!fixtures_away_team_id_fkey(name, logo)
          `)
          .eq('competition_id', competitionId)
          .eq('season', season)
          .order('match_date', { ascending: true });
        
        if (round) {
          query = query.eq('round', round);
        }
        
        const { data: fixtures, error } = await query;
        if (error) throw error;
        
        // Get user predictions for this league if available
        let predictions: Prediction[] = [];
        if (user && leagueId) {
          const { data: predData } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id)
            .eq('league_id', leagueId);
          
          predictions = predData || [];
        }
        
        // Check if round predictions are still open
        const canPredict = round ? await checkCanPredictRound(competitionId!, season!, round) : false;
        
        return fixtures.map(fixture => {
          const prediction = predictions.find(p => p.fixture_id === fixture.id);
          return {
            ...fixture,
            home_team_name: fixture.home_team?.name,
            home_team_logo: fixture.home_team?.logo,
            away_team_name: fixture.away_team?.name,
            away_team_logo: fixture.away_team?.logo,
            home_goals_prediction: prediction?.home_goals_prediction,
            away_goals_prediction: prediction?.away_goals_prediction,
            points_earned: prediction?.points_earned,
            can_predict: canPredict,
          };
        }) as Fixture[];
      },
      enabled: !!competitionId && !!season,
    });
  };