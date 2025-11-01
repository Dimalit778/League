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
          area: string
          code: string
          created_at: string
          current_matchday: number | null
          flag: string
          id: number
          logo: string
          name: string
          season_end: string | null
          season_id: number | null
          season_start: string | null
          total_matchdays: number | null
          type: string
          updated_at: string
        }
        Insert: {
          area: string
          code: string
          created_at?: string
          current_matchday?: number | null
          flag: string
          id: number
          logo: string
          name: string
          season_end?: string | null
          season_id?: number | null
          season_start?: string | null
          total_matchdays?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          area?: string
          code?: string
          created_at?: string
          current_matchday?: number | null
          flag?: string
          id?: number
          logo?: string
          name?: string
          season_end?: string | null
          season_id?: number | null
          season_start?: string | null
          total_matchdays?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      league_members: {
        Row: {
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
          away_team_id: number | null
          competition_id: number | null
          created_at: string
          group: string | null
          home_team_id: number | null
          id: number
          kick_off: string
          matchday: number
          referee: string | null
          score: Json | null
          stage: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          away_team_id?: number | null
          competition_id?: number | null
          created_at?: string
          group?: string | null
          home_team_id?: number | null
          id: number
          kick_off: string
          matchday: number
          referee?: string | null
          score?: Json | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          away_team_id?: number | null
          competition_id?: number | null
          created_at?: string
          group?: string | null
          home_team_id?: number | null
          id?: number
          kick_off?: string
          matchday?: number
          referee?: string | null
          score?: Json | null
          stage?: string | null
          status?: string | null
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
          league_id: string
          league_member_id: string
          match_id: number
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          is_finished?: boolean
          league_id: string
          league_member_id: string
          match_id: number
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          is_finished?: boolean
          league_id?: string
          league_member_id?: string
          match_id?: number
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
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
          shortName: string | null
          tla: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
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
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          provider: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          provider?: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          provider?: string
          role?: string
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
      can_access_league: { Args: { league_id: string }; Returns: boolean }
      create_new_league: {
        Args: {
          avatar_url?: string
          competition_id: number
          league_name: string
          max_members: number
          nickname: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
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
          league_id: string
          league_name: string
          message: string
          success: boolean
        }[]
      }
      leave_league: { Args: { p_league_id: string }; Returns: Json }
      rls_storage_is_league_member: {
        Args: { lg: string; uid: string }
        Returns: boolean
      }
      rls_storage_is_member_owner: {
        Args: { path_part: string; uid: string }
        Returns: boolean
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
