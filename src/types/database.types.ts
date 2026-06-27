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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          area: string
          code: string
          created_at: string
          current_fixture: number | null
          current_stage: string | null
          flag: string | null
          id: number
          is_free: boolean
          logo: string
          name: string
          season_end: string | null
          season_id: number | null
          season_start: string | null
          total_fixtures: number | null
          type: string
          updated_at: string
        }
        Insert: {
          area: string
          code: string
          created_at?: string
          current_fixture?: number | null
          current_stage?: string | null
          flag?: string | null
          id: number
          is_free?: boolean
          logo: string
          name: string
          season_end?: string | null
          season_id?: number | null
          season_start?: string | null
          total_fixtures?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          area?: string
          code?: string
          created_at?: string
          current_fixture?: number | null
          current_stage?: string | null
          flag?: string | null
          id?: number
          is_free?: boolean
          logo?: string
          name?: string
          season_end?: string | null
          season_id?: number | null
          season_start?: string | null
          total_fixtures?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      league_members: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          id: string
          is_primary: boolean
          league_id: string
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          league_id: string
          nickname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          league_id?: string
          nickname?: string
          updated_at?: string
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
          created_at: string
          id: string
          join_code: string
          max_members: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          competition_id: number
          created_at?: string
          id?: string
          join_code: string
          max_members?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          competition_id?: number
          created_at?: string
          id?: string
          join_code?: string
          max_members?: number
          name?: string
          owner_id?: string
          updated_at?: string
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
      matches: {
        Row: {
          ai_generated_at: string | null
          ai_predicted_away_score: number | null
          ai_predicted_home_score: number | null
          ai_summary_en: string | null
          ai_summary_he: string | null
          away_team_id: number | null
          competition_id: number | null
          created_at: string
          fixture: number | null
          group: string | null
          home_team_id: number | null
          id: number
          kick_off: string
          referee: string | null
          score: Json | null
          stage: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          updated_at: string
        }
        Insert: {
          ai_generated_at?: string | null
          ai_predicted_away_score?: number | null
          ai_predicted_home_score?: number | null
          ai_summary_en?: string | null
          ai_summary_he?: string | null
          away_team_id?: number | null
          competition_id?: number | null
          created_at?: string
          fixture?: number | null
          group?: string | null
          home_team_id?: number | null
          id: number
          kick_off: string
          referee?: string | null
          score?: Json | null
          stage?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string
        }
        Update: {
          ai_generated_at?: string | null
          ai_predicted_away_score?: number | null
          ai_predicted_home_score?: number | null
          ai_summary_en?: string | null
          ai_summary_he?: string | null
          away_team_id?: number | null
          competition_id?: number | null
          created_at?: string
          fixture?: number | null
          group?: string | null
          home_team_id?: number | null
          id?: number
          kick_off?: string
          referee?: string | null
          score?: Json | null
          stage?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          is_finished: boolean
          league_member_id: string
          match_id: number
          points: number
          updated_at: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          is_finished?: boolean
          league_member_id: string
          match_id: number
          points?: number
          updated_at?: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          is_finished?: boolean
          league_member_id?: string
          match_id?: number
          points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "league_leaderboard_view"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "predictions_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "league_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          clubColors: string | null
          created_at: string
          id: number
          logo: string
          name: string
          shortName: string | null
          tla: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          clubColors?: string | null
          created_at?: string
          id: number
          logo: string
          name: string
          shortName?: string | null
          tla?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          clubColors?: string | null
          created_at?: string
          id?: number
          logo?: string
          name?: string
          shortName?: string | null
          tla?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          entitlement_id: string | null
          expires_at: string | null
          plan: string
          product_id: string | null
          revenuecat_app_user_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          entitlement_id?: string | null
          expires_at?: string | null
          plan?: string
          product_id?: string | null
          revenuecat_app_user_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          entitlement_id?: string | null
          expires_at?: string | null
          plan?: string
          product_id?: string | null
          revenuecat_app_user_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notification_token: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          notification_token?: string | null
          provider?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notification_token?: string | null
          provider?: string
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
          member_id: string | null
          nickname: string | null
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
      create_new_league: {
        Args: {
          avatar_url?: string
          competition_id: number
          league_name: string
          max_members: number
          nickname: string
        }
        Returns: string
      }
      delete_own_account: { Args: never; Returns: undefined }
      delete_owned_league: { Args: { p_league_id: string }; Returns: Json }
      find_league_by_code: {
        Args: { p_join_code: string }
        Returns: {
          competition_area: string
          competition_flag: string
          competition_logo: string
          competition_name: string
          league_id: string
          league_name: string
          max_members: number
          members_count: number
          owner_nickname: string
        }[]
      }
      get_plan_limits: {
        Args: { p_plan: string }
        Returns: {
          max_leagues: number
          max_members: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_league_member: { Args: { league_id_param: string }; Returns: boolean }
      is_league_owner: { Args: { league_id_param: string }; Returns: boolean }
      is_member_in_league: {
        Args: { _league: string; _user: string }
        Returns: boolean
      }
      join_league: {
        Args: {
          league_join_code: string
          user_avatar_url?: string
          user_nickname: string
        }
        Returns: {
          active: boolean
          avatar_url: string | null
          created_at: string
          id: string
          is_primary: boolean
          league_id: string
          nickname: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "league_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leave_league: { Args: { p_league_id: string }; Returns: Json }
      rls_is_member_self: { Args: { _member: string }; Returns: boolean }
      rls_is_user_in_league: { Args: { _league: string }; Returns: boolean }
      set_primary_league: { Args: { p_league_id: string }; Returns: Json }
      user_exists: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      match_status:
        | "TIMED"
        | "SCHEDULED"
        | "IN_PLAY"
        | "LIVE"
        | "FINISHED"
        | "POSTPONED"
        | "PAUSED"
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
      match_status: [
        "TIMED",
        "SCHEDULED",
        "IN_PLAY",
        "LIVE",
        "FINISHED",
        "POSTPONED",
        "PAUSED",
      ],
    },
  },
} as const
