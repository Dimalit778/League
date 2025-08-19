import { supabase } from "@/lib/supabase";

export const membersService = {
    async getLeaderboard(leagueId: string) {
      
      const { data: members, error: membersError } = await supabase
        .from("league_members")
        .select("id, nickname, avatar_url, user_id")
        .eq("league_id", leagueId);
      
      if(membersError) throw new Error(membersError.message);
      
      // Get all members with their total points from predictions
      const membersWithPoints = await Promise.all(
        members?.map(async (member) => {
          const { data: predictions, error: predictionsError } = await supabase
            .from("predictions")
            .select("points_earned")
            .eq("user_id", member.user_id)
            .eq("league_id", leagueId);
            
          if(predictionsError) throw new Error(predictionsError.message);
          
          const totalPoints = predictions?.reduce((total, prediction) => 
            total + (prediction.points_earned || 0), 0
          ) || 0;
          
          return {
            ...member,
            points: totalPoints
          };
        }) || []
      );
      
  
      return membersWithPoints;
    },
   
  };
  
  
  