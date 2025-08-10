// types/fixtures.ts
import { Tables } from "@/types/database.types";

// Base type - teams can be null (from database)
export type FixtureWithTeams = Tables<"fixtures"> & {
  home_team: Tables<"teams"> 
  away_team: Tables<"teams"> 
};

// Type for when teams are guaranteed to exist
export type FixtureWithRequiredTeams = Tables<"fixtures"> & {
  home_team: Tables<"teams">;
  away_team: Tables<"teams">;
};

// Type guard to check if fixture has both teams
export function fixtureHasTeams(
  fixture: FixtureWithTeams
): fixture is FixtureWithRequiredTeams {
  return fixture.home_team !== null && fixture.away_team !== null;
}

// Type for rounds data structure
export interface RoundsData {
  rounds: string[];
}

// Type for league with competitions
export type LeagueWithCompetitions = Tables<"leagues"> & {
  competitions: Tables<"competitions"> & {
    rounds_data: RoundsData | null;
  };
};