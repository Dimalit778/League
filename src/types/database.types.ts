export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          country: string
          created_at: string
          current_round: string | null
          flag: string
          id: number
          logo: string
          name: string
          rounds_data: Json | null
          season: number | null
          type: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          current_round?: string | null
          flag: string
          id: number
          logo: string
          name: string
          rounds_data?: Json | null
          season?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          current_round?: string | null
          flag?: string
          id?: number
          logo?: string
          name?: string
          rounds_data?: Json | null
          season?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_score: number | null
          away_team_id: number
          competition_id: number
          created_at: string
          date: string
          home_score: number | null
          home_team_id: number
          id: number
          round: string
          season: number
          status_long: string | null
          updated_at: string
          venue_city: string | null
          venue_name: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id: number
          competition_id: number
          created_at?: string
          date: string
          home_score?: number | null
          home_team_id: number
          id: number
          round: string
          season: number
          status_long?: string | null
          updated_at?: string
          venue_city?: string | null
          venue_name?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: number
          competition_id?: number
          created_at?: string
          date?: string
          home_score?: number | null
          home_team_id?: number
          id?: number
          round?: string
          season?: number
          status_long?: string | null
          updated_at?: string
          venue_city?: string | null
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
            foreignKeyName: "fixtures_competition_id_fkey"
            columns: ["competition_id"]
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
        ]
      }
      league_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_primary: boolean
          league_id: string
          nickname: string
          update_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean
          league_id: string
          nickname: string
          update_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean
          league_id?: string
          nickname?: string
          update_at?: string | null
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
            foreignKeyName: "league_members_user_id_fkey"
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
          created_at: string | null
          id: string
          join_code: string
          max_members: number
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          competition_id: number
          created_at?: string | null
          id?: string
          join_code: string
          max_members?: number
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          competition_id?: number
          created_at?: string | null
          id?: string
          join_code?: string
          max_members?: number
          name?: string
          owner_id?: string
          updated_at?: string | null
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
        ]
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string | null
          fixture_id: number
          home_score: number
          id: string
          is_processed: boolean | null
          league_id: string
          points: number | null
          updated_at: string | null
          user_id: string
          winner: string | null
        }
        Insert: {
          away_score: number
          created_at?: string | null
          fixture_id: number
          home_score: number
          id?: string
          is_processed?: boolean | null
          league_id: string
          points?: number | null
          updated_at?: string | null
          user_id: string
          winner?: string | null
        }
        Update: {
          away_score?: number
          created_at?: string | null
          fixture_id?: number
          home_score?: number
          id?: string
          is_processed?: boolean | null
          league_id?: string
          points?: number | null
          updated_at?: string | null
          user_id?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
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
          created_at: string
          end_date: string
          id: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          access_advanced_stats?: boolean
          can_add_members?: boolean
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          access_advanced_stats?: boolean
          can_add_members?: boolean
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          subscription_type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string
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
          created_at: string
          id: number
          logo: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          logo: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          logo?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      league_leaderboard_view: {
        Row: {
          avatar_url: string | null
          league_id: string | null
          nickname: string | null
          predictions_count: number | null
          total_points: number | null
          user_id: string | null
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
          },
        ]
      }
    }
    Functions: {
      can_access_league: {
        Args: { league_id: string }
        Returns: boolean
      }
      can_predict_round: {
        Args: { comp_id: number; round_name: string; season_year: number }
        Returns: boolean
      }
      create_league_with_member: {
        Args: {
          competition_id: number
          creator_avatar_url?: string
          creator_nickname: string
          creator_user_id: string
          league_name: string
          max_members?: number
        }
        Returns: {
          join_code: string
          league_id: string
          message: string
          success: boolean
        }[]
      }
      generate_join_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_league_members_with_points: {
        Args: { p_league_id: string }
        Returns: {
          avatar_url: string
          nickname: string
          predictions_count: number
          total_points: number
          user_id: string
        }[]
      }
      get_member_predictions: {
        Args: { p_league_id: string }
        Returns: {
          avatar_url: string
          away_score: number
          created_at: string
          fixture_id: number
          home_score: number
          is_processed: boolean
          nickname: string
          points: number
          prediction_id: string
          user_id: string
          winner: string
        }[]
      }
      get_members_fixture_points: {
        Args: { p_fixture_id: number; p_league_id: string }
        Returns: {
          avatar_url: string
          away_score: number
          home_score: number
          is_processed: boolean
          nickname: string
          points: number
          user_id: string
          winner: string
        }[]
      }
      get_user_leagues: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string
          competition_id: number
          competition_logo: string
          competition_name: string
          created_at: string
          is_owner: boolean
          is_primary: boolean
          join_code: string
          league_id: string
          league_name: string
          max_members: number
          member_count: number
          nickname: string
          owner_id: string
          total_points: number
        }[]
      }
      join_league: {
        Args: {
          joining_user_id: string
          league_join_code: string
          user_avatar_url?: string
          user_nickname: string
        }
        Returns: {
          league_id: string
          league_name: string
          message: string
          success: boolean
        }[]
      }
      update_user_primary_league: {
        Args: { p_league_id: number; p_user_id: string }
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
