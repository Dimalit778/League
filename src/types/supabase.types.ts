export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competitions: {
        Row: {
          id: number
          name: string
          country: string
          logo: string
          flag: string
          season: number
          round: string
          createdAt: string
          updatedAt: string
          type: string
        }
        Insert: {
          id?: number
          name: string
          country: string
          logo: string
          flag: string
          season: number
          round: string
          createdAt?: string
          updatedAt?: string
          type?: string
        }
        Update: {
          id?: number
          name?: string
          country?: string
          logo?: string
          flag?: string
          season?: number
          round?: string
          createdAt?: string
          updatedAt?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_league_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["league_id"]
          },
          {
            foreignKeyName: "leagues_competition_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["competition_id"]
          }
        ]
      }
      teams: {
        Row: {
          id: number
          name: string
          logo: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          name: string
          logo: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          name?: string
          logo?: string
          createdAt?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["home_team_id"]
          },
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["away_team_id"]
          }
        ]
      }
      leagues: {
        Row: {
          id: string
          name: string
          join_code: string
          owner_id: string
          createdAt: string
          updatedAt: string
          competition_id: number
          max_members: number
        }
        Insert: {
          id?: string
          name: string
          join_code: string
          owner_id: string
          createdAt?: string
          updatedAt?: string
          competition_id: number
          max_members?: number
        }
        Update: {
          id?: string
          name?: string
          join_code?: string
          owner_id?: string
          createdAt?: string
          updatedAt?: string
          competition_id?: number
          max_members?: number
        }
        Relationships: [
          {
            foreignKeyName: "leagues_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "league_members"
            referencedColumns: ["league_id"]
          }
        ]
      }
      league_members: {
        Row: {
          id: number
          league_id: string
          user_id: string
          joined_at: string
          updatedAt: string
          createdAt: string
          primary_league: boolean | null
          nickname: string | null
          points: number | null
          avatar_url: string | null
        }
        Insert: {
          id?: number
          league_id: string
          user_id: string
          joined_at?: string
          updatedAt?: string
          createdAt?: string
          primary_league?: boolean | null
          nickname?: string | null
          points?: number | null
          avatar_url?: string | null
        }
        Update: {
          id?: number
          league_id?: string
          user_id?: string
          joined_at?: string
          updatedAt?: string
          createdAt?: string
          primary_league?: boolean | null
          nickname?: string | null
          points?: number | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      fixtures: {
        Row: {
          id: number
          league_id: number
          season: number
          round: string
          date: string
          timestamp: number | null
          referee: string | null
          timezone: string | null
          status_long: string | null
          venue_id: number | null
          venue_name: string | null
          venue_city: string | null
          home_team_id: number
          away_team_id: number
          goals_home: number | null
          goals_away: number | null
          score_halftime_home: number | null
          score_halftime_away: number | null
          score_fulltime_home: number | null
          score_fulltime_away: number | null
          score_extratime_home: number | null
          score_extratime_away: number | null
          score_penalty_home: number | null
          score_penalty_away: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          league_id: number
          season: number
          round: string
          date: string
          timestamp?: number | null
          referee?: string | null
          timezone?: string | null
          status_long?: string | null
          venue_id?: number | null
          venue_name?: string | null
          venue_city?: string | null
          home_team_id: number
          away_team_id: number
          goals_home?: number | null
          goals_away?: number | null
          score_halftime_home?: number | null
          score_halftime_away?: number | null
          score_fulltime_home?: number | null
          score_fulltime_away?: number | null
          score_extratime_home?: number | null
          score_extratime_away?: number | null
          score_penalty_home?: number | null
          score_penalty_away?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          league_id?: number
          season?: number
          round?: string
          date?: string
          timestamp?: number | null
          referee?: string | null
          timezone?: string | null
          status_long?: string | null
          venue_id?: number | null
          venue_name?: string | null
          venue_city?: string | null
          home_team_id?: number
          away_team_id?: number
          goals_home?: number | null
          goals_away?: number | null
          score_halftime_home?: number | null
          score_halftime_away?: number | null
          score_fulltime_home?: number | null
          score_fulltime_away?: number | null
          score_extratime_home?: number | null
          score_extratime_away?: number | null
          score_penalty_home?: number | null
          score_penalty_away?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_predictions_fixture_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "user_predictions"
            referencedColumns: ["fixture_id"]
          },
          {
            foreignKeyName: "fixtures_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription: {
        Row: {
          id: string
          subscription_type: "FREE" | "BASIC" | "PREMIUM"
          start_date: string
          end_date: string
          user_id: string
          can_add_members: boolean
          access_advanced_stats: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          subscription_type: "FREE" | "BASIC" | "PREMIUM"
          start_date: string
          end_date: string
          user_id: string
          can_add_members?: boolean
          access_advanced_stats?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          subscription_type?: "FREE" | "BASIC" | "PREMIUM"
          start_date?: string
          end_date?: string
          user_id?: string
          can_add_members?: boolean
          access_advanced_stats?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_predictions: {
        Row: {
          id: string
          user_id: string
          fixture_id: number
          predicted_home_score: number
          predicted_away_score: number
          points: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          user_id: string
          fixture_id: number
          predicted_home_score: number
          predicted_away_score: number
          points?: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          user_id?: string
          fixture_id?: number
          predicted_home_score?: number
          predicted_away_score?: number
          points?: number
          createdAt?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_predictions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_type: "FREE" | "BASIC" | "PREMIUM"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type League = Database['public']['Tables']['leagues']['Row']
export type LeagueMember = Database['public']['Tables']['league_members']['Row']
export type Competition = Database['public']['Tables']['competitions']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Fixture = Database['public']['Tables']['fixtures']['Row']
export type UserPrediction = Database['public']['Tables']['user_predictions']['Row']
export type Subscription = Database['public']['Tables']['subscription']['Row']

// Insert types
export type LeagueInsert = Database['public']['Tables']['leagues']['Insert']
export type LeagueMemberInsert = Database['public']['Tables']['league_members']['Insert']
export type CompetitionInsert = Database['public']['Tables']['competitions']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type FixtureInsert = Database['public']['Tables']['fixtures']['Insert']
export type UserPredictionInsert = Database['public']['Tables']['user_predictions']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscription']['Insert']

// Update types
export type LeagueUpdate = Database['public']['Tables']['leagues']['Update']
export type LeagueMemberUpdate = Database['public']['Tables']['league_members']['Update']
export type CompetitionUpdate = Database['public']['Tables']['competitions']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type FixtureUpdate = Database['public']['Tables']['fixtures']['Update']
export type UserPredictionUpdate = Database['public']['Tables']['user_predictions']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscription']['Update']

// Custom types for your app logic
export interface LeagueWithMembers extends League {
  league_members: LeagueMember[]
}

export interface LeagueWithCompetition extends League {
  competitions: Competition
}

export interface LeagueMemberWithLeague extends LeagueMember {
  leagues: League
}

export interface FixtureWithTeams extends Fixture {
  home_team: Team
  away_team: Team
}

export interface UserPredictionWithFixture extends UserPrediction {
  fixtures: FixtureWithTeams
}