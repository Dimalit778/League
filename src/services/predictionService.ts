import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type UserPrediction = Tables<"predictions">;
type UserPredictionInsert = TablesInsert<"predictions">;
type UserPredictionUpdate = TablesUpdate<"predictions">;
type Fixture = Tables<"fixtures">;

export const predictionService = {
  // * Done 
  // Update Prediction Points
  async updatePredictionPoints(fixtureId: number) {
    const { data: fixture, error: fixtureError } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .single();

    if (fixtureError || !fixture) throw new Error("Fixture not found");

    const { data: predictions, error: predictionsError } = await supabase
      .from("user_predictions")
      .select("*")
      .eq("fixture_id", fixtureId);

    if (predictionsError) throw predictionsError;

    const updates = await Promise.all(
      predictions.map(async (prediction) => {
        const points = await this.calculatePoints(prediction, fixture);
        return this.updatePrediction(prediction.id, { points });
      })
    );

    return updates;
  },
  // * Done 
  // Create Or Update Prediction
  async createOrUpdatePrediction(
    userId: string,
    fixtureId: number,
    homeScore: number,
      awayScore: number,
    leagueId: string
  ) {
    const canPredict = await this.canUserPredict(fixtureId);
    if (!canPredict) {
      throw new Error("Cannot make predictions for this match. The match has already started or time has passed.");
    }

    const existingPrediction = await this.getPredictionByUserAndFixture(userId, fixtureId);
    
    if (existingPrediction) {
      return this.updatePrediction(existingPrediction.id, {
        home_score: homeScore,
        away_score: awayScore,
        updated_at: new Date().toISOString()
      });
    } else {
      return this.createPrediction({
        user_id: userId,
        fixture_id: fixtureId,
        home_score: homeScore,
        away_score: awayScore,
        points: 0,
        league_id: leagueId
      });
    }
  },
  // Create 
  async createPrediction(prediction: UserPredictionInsert) {
    const { data, error } = await supabase
      .from("predictions")
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // Update Prediction
  async updatePrediction(id: string, updates: UserPredictionUpdate) {
    const { data, error } = await supabase
      .from("user_predictions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // Get User Predictions
  async getUserPredictions(userId: string, fixtureIds?: number[]) {
    let query = supabase
      .from("predictions")
      .select(`
        *,
        fixtures!inner(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        )
      `)
      .eq("user_id", userId);

    if (fixtureIds && fixtureIds.length > 0) {
      query = query.in("fixture_id", fixtureIds);
    }

    const { data, error } = await query.order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  },
   // Delete Prediction
   async deletePrediction(id: string) {
    const { error } = await supabase
      .from("predictions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
  // Get Prediction By User And Fixture
  async getPredictionByUserAndFixture(userId: string, fixtureId: number) {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("fixture_id", fixtureId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
 
  // Get League Predictions
  async getLeaguePredictions(_leagueId: number, fixtureId?: number) {
    let query = supabase
      .from("predictions")
      .select(`
        *,
        users!inner(full_name, avatar_url),
        fixtures!inner(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        )
      `);

    if (fixtureId) {
      query = query.eq("fixture_id", fixtureId);
    }

    const { data, error } = await query.order("points", { ascending: false });

    if (error) throw error;
    return data;
  },
  // Can User Predict
  async canUserPredict(fixtureId: number): Promise<boolean> {
    const { data: fixture, error } = await supabase
      .from("fixtures")
      .select("date, timestamp, status_long, round, league_id")
      .eq("id", fixtureId)
      .single();

    if (error || !fixture) return false;

    const now = new Date();
    const matchTime = new Date(fixture.date);
    
    return now < matchTime && fixture.status_long === "Not Started";
  },
  // Can User Predict Round
  async canUserPredictRound(competitionId: number, round: string): Promise<boolean> {
    const { data: fixtures, error } = await supabase
      .from("fixtures")
      .select("date, timestamp")
      .eq("league_id", competitionId)
      .eq("round", round)
      .order("date", { ascending: true })
      .limit(1);

    if (error || !fixtures || fixtures.length === 0) return false;

    const now = new Date();
    const firstMatchTime = new Date(fixtures[0].date);
    
    return now < firstMatchTime;
  },
  // Calculate Points
  async calculatePoints(prediction: UserPrediction, fixture: Fixture): Promise<number> {
    if (!fixture.home_score && fixture.home_score !== 0) return 0;
    if (!fixture.away_score && fixture.away_score !== 0) return 0;

    const actualHomeScore = fixture.home_score;
    const actualAwayScore = fixture.away_score;
    const predictedHomeScore = prediction.home_score || 0;
    const predictedAwayScore = prediction.away_score || 0;

    let points = 0;

    if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
      points = 10;
    } else {
      const actualResult = actualHomeScore > actualAwayScore ? 'home' : 
                          actualHomeScore < actualAwayScore ? 'away' : 'draw';
      const predictedResult = predictedHomeScore > predictedAwayScore ? 'home' : 
                             predictedHomeScore < predictedAwayScore ? 'away' : 'draw';
      
      if (actualResult === predictedResult) {
        points = 3;
      }
    }

    return points;
  },

  // Generate Random Predictions
  async generateRandomPredictions(competitionId: number, round: string, userId: string) {
    const { data: fixtures, error } = await supabase
      .from("fixtures")
      .select("id")
      .eq("league_id", competitionId)
      .eq("round", round)
      .eq("status_long", "Not Started");

    if (error || !fixtures) return;

    const randomPredictions = fixtures.map(fixture => ({
      user_id: userId,
      fixture_id: fixture.id,
      predicted_home_score: Math.floor(Math.random() * 4),
      predicted_away_score: Math.floor(Math.random() * 4),
      points: 0
    }));

    for (const prediction of randomPredictions) {
      try {
        const existing = await this.getPredictionByUserAndFixture(userId, prediction.fixture_id);
        if (!existing) {
          await this.createPrediction(prediction);
        }
      } catch (error) {
        console.error(`Failed to create random prediction for fixture ${prediction.fixture_id}:`, error);
      }
    }
  },
 
  // Process Round For Auto Predictions
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
  // Process All Active Competitions
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
  // Schedule Auto Predictions
  async scheduleAutoPredictions() {
    // This would be called periodically (e.g., every hour)
    // In a real app, you'd use a background task or cron job
    console.log("Checking for auto-predictions...");
    await this.processAllActiveCompetitions();
  }

};