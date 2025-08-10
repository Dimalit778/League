
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          country: string
          createdAt: string
          current_round: string | null
          flag: string
          id: number
          logo: string
          name: string
          rounds_data: {
            rounds: string[];
            total_rounds: number;
            synced_at: string | null;
          } | null;
          season: number | null
          type: string
          updatedAt: string
        }
        Insert: {
          country: string
          createdAt?: string
          current_round?: string | null
          flag: string
          id: number
          logo: string
          rounds_data?: {
            rounds: string[];
            total_rounds: number;
            synced_at: string | null;
          } | null;
          season?: number | null
          type?: string
          updatedAt?: string
        }
        Update: {
          country?: string
          createdAt?: string
          current_round?: string | null
          flag?: string
          id?: number
          logo?: string
          rounds_data?: {
            rounds: string[];
            total_rounds: number;
            synced_at: string | null;
          } | null;
          season?: number | null
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_team_id: number
          createdAt: string
          date: string
          goals_away: number | null
          goals_home: number | null
          home_team_id: number
          id: number
          league_id: number
          referee: string | null
          round: string
          score_extratime_away: number | null
          score_extratime_home: number | null
          score_fulltime_away: number | null
          score_fulltime_home: number | null
          score_halftime_away: number | null
          score_halftime_home: number | null
          score_penalty_away: number | null
          score_penalty_home: number | null
          season: number
          status_long: string | null
          timestamp: number | null
          timezone: string | null
          updatedAt: string
          venue_city: string | null
          venue_id: number | null
          venue_name: string | null
        }
        Insert: {
          away_team_id: number
          createdAt?: string
          date: string
          goals_away?: number | null
          goals_home?: number | null
          home_team_id: number
          id: number
          league_id: number
          referee?: string | null
          round: string
          score_extratime_away?: number | null
          score_extratime_home?: number | null
          score_fulltime_away?: number | null
          score_fulltime_home?: number | null
          score_halftime_away?: number | null
          score_halftime_home?: number | null
          score_penalty_away?: number | null
          score_penalty_home?: number | null
          season: number
          status_long?: string | null
          timestamp?: number | null
          timezone?: string | null
          updatedAt?: string
          venue_city?: string | null
          venue_id?: number | null
          venue_name?: string | null
        }
        Update: {
          away_team_id?: number
          createdAt?: string
          date?: string
          goals_away?: number | null
          goals_home?: number | null
          home_team_id?: number
          id?: number
          league_id?: number
          referee?: string | null
          round?: string
          score_extratime_away?: number | null
          score_extratime_home?: number | null
          score_fulltime_away?: number | null
          score_fulltime_home?: number | null
          score_halftime_away?: number | null
          score_halftime_home?: number | null
          score_penalty_away?: number | null
          score_penalty_home?: number | null
          season?: number
          status_long?: string | null
          timestamp?: number | null
          timezone?: string | null
          updatedAt?: string
          venue_city?: string | null
          venue_id?: number | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
            foreignKeyName: "fixtures_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: number
          is_primary: boolean
          joined_at: string | null
          league_id: number
          nickname: string
          points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: number
          is_primary?: boolean
          joined_at?: string | null
          league_id: number
          nickname: string
          points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: number
          is_primary?: boolean
          joined_at?: string | null
          league_id?: number
          nickname?: string
          points?: number | null
          updated_at?: string | null
          user_id?: string
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
            foreignKeyName: "league_members_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          competition_id: number
          createdAt: string
          id: number
          join_code: string
          league_logo: string
          max_members: number
          name: string | null
          owner_id: string
          rounds: number
          updateAt: string
        }
        Insert: {
          competition_id: number
          createdAt?: string
          id?: never
          join_code: string
          league_logo: string
          max_members?: number
          name?: string | null
          owner_id: string
          rounds?: number
          updateAt?: string
        }
        Update: {
          competition_id?: number
          createdAt?: string
          id?: never
          join_code?: string
          league_logo?: string
          max_members?: number
          name?: string | null
          owner_id?: string
          rounds?: number
          updateAt?: string
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
            foreignKeyName: "leagues_owner_id_fkey1"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription: {
        Row: {
          access_advanced_stats: boolean
          can_add_members: boolean
          createdAt: string
          end_date: string
          id: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updatedAt: string
          user_id: string
        }
        Insert: {
          access_advanced_stats?: boolean
          can_add_members?: boolean
          createdAt?: string
          end_date: string
          id?: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updatedAt?: string
          user_id: string
        }
        Update: {
          access_advanced_stats?: boolean
          can_add_members?: boolean
          createdAt?: string
          end_date?: string
          id?: string
          start_date?: string
          subscription_type?: Database["public"]["Enums"]["subscription_type"]
          updatedAt?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          createdAt: string
          id: number
          logo: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: number
          logo: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: number
          logo?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      user_predictions: {
        Row: {
          createdAt: string
          fixture_id: number
          id: string
          points: number
          predicted_away_score: number
          predicted_home_score: number
          updatedAt: string
          user_id: string
        }
        Insert: {
          createdAt?: string
          fixture_id: number
          id?: string
          points?: number
          predicted_away_score: number
          predicted_home_score: number
          updatedAt?: string
          user_id: string
        }
        Update: {
          createdAt?: string
          fixture_id?: number
          id?: string
          points?: number
          predicted_away_score?: number
          predicted_home_score?: number
          updatedAt?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_predictions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          createdAt: string
          email: string | null
          full_name: string
          id: string
          updatedAt: string
        }
        Insert: {
          avatar_url?: string | null
          createdAt?: string
          email?: string | null
          full_name: string
          id: string
          updatedAt?: string
        }
        Update: {
          avatar_url?: string | null
          createdAt?: string
          email?: string | null
          full_name?: string
          id?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_league: {
        Args: {
          p_name: string
          p_nickname: string
          p_league_logo: string
          p_join_code: string
          p_max_members: number
          p_competition_id: number
          p_owner_id: string
        }
        Returns: Json
      }
      update_user_primary_league: {
        Args: { p_user_id: string; p_league_id: number }
        Returns: undefined
      }
    }
    Enums: {
      subscription_type: "FREE" | "BASIC" | "PREMIUM"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      subscription_type: ["FREE", "BASIC", "PREMIUM"],
    },
  },
} as const
