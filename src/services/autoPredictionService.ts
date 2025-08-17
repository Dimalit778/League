import { predictionService } from "./predictionService";
import { fixtureService } from "./fixtureService";
import { supabase } from "@/lib/supabase";

export const autoPredictionService = {
  async processRoundForAutoPredictions(competitionId: number, round: string) {
    try {
      // Get all fixtures for this round that are about to start (within 1 hour)
      const { data: fixtures, error: fixturesError } = await supabase
        .from("fixtures")
        .select("id, date")
        .eq("league_id", competitionId)
        .eq("round", round)
        .eq("status_long", "Not Started");

      if (fixturesError || !fixtures) {
        console.error("Failed to get fixtures:", fixturesError);
        return;
      }

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Filter fixtures that start within the next hour
      const upcomingFixtures = fixtures.filter(fixture => {
        const matchTime = new Date(fixture.date);
        return matchTime <= oneHourFromNow && matchTime > now;
      });

      if (upcomingFixtures.length === 0) {
        return;
      }

      // Get all leagues using this competition
      const { data: leagues, error: leaguesError } = await supabase
        .from("leagues")
        .select("id")
        .eq("competition_id", competitionId);

      if (leaguesError || !leagues) {
        console.error("Failed to get leagues:", leaguesError);
        return;
      }

      // For each league, get all members
      for (const league of leagues) {
        const { data: members, error: membersError } = await supabase
          .from("league_members")
          .select("user_id")
          .eq("league_id", league.id);

        if (membersError || !members) {
          continue;
        }

        // For each member, check if they have predictions for the upcoming fixtures
        for (const member of members) {
          for (const fixture of upcomingFixtures) {
            const existingPrediction = await predictionService.getPredictionByUserAndFixture(
              member.user_id,
              fixture.id
            );

            // If no prediction exists, create a random one
            if (!existingPrediction) {
              try {
                await predictionService.createPrediction({
                  user_id: member.user_id,
                  fixture_id: fixture.id,
                  predicted_home_score: Math.floor(Math.random() * 4),
                  predicted_away_score: Math.floor(Math.random() * 4),
                  points: 0
                });

                console.log(`Created auto-prediction for user ${member.user_id}, fixture ${fixture.id}`);
              } catch (error) {
                console.error(`Failed to create auto-prediction:`, error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Auto-prediction service error:", error);
    }
  },

  async processAllActiveCompetitions() {
    try {
      // Get all active competitions
      const { data: competitions, error } = await supabase
        .from("competitions")
        .select("id, current_round")
        .not("current_round", "is", null);

      if (error || !competitions) {
        return;
      }

      // Process each competition's current round
      for (const competition of competitions) {
        if (competition.current_round) {
          await this.processRoundForAutoPredictions(
            competition.id,
            competition.current_round
          );
        }
      }
    } catch (error) {
      console.error("Failed to process all active competitions:", error);
    }
  },

  async scheduleAutoPredictions() {
    // This would be called periodically (e.g., every hour)
    // In a real app, you'd use a background task or cron job
    console.log("Checking for auto-predictions...");
    await this.processAllActiveCompetitions();
  }
};