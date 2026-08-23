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
          current_matchday: number | null
          current_stage: string | null
          flag: string | null
          id: number
          is_free: boolean
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
          current_stage?: string | null
          flag?: string | null
          id: number
          is_free?: boolean
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
          current_stage?: string | null
          flag?: string | null
          id?: number
          is_free?: boolean
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
      content_reports: {
        Row: {
          content_snapshot: string
          content_type: string
          created_at: string
          details: string | null
          id: string
          league_id: string | null
          league_member_id: string | null
          moderator_user_id: string | null
          reason: string
          reporter_user_id: string | null
          resolution_action: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          status: string
          target_user_id: string | null
        }
        Insert: {
          content_snapshot: string
          content_type: string
          created_at?: string
          details?: string | null
          id?: string
          league_id?: string | null
          league_member_id?: string | null
          moderator_user_id?: string | null
          reason: string
          reporter_user_id?: string | null
          resolution_action?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          status?: string
          target_user_id?: string | null
        }
        Update: {
          content_snapshot?: string
          content_type?: string
          created_at?: string
          details?: string | null
          id?: string
          league_id?: string | null
          league_member_id?: string | null
          moderator_user_id?: string | null
          reason?: string
          reporter_user_id?: string | null
          resolution_action?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          status?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "league_leaderboard_view"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "content_reports_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "league_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "member_league_summary_view"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "content_reports_moderator_user_id_fkey"
            columns: ["moderator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      football_api_calls: {
        Row: {
          called_at: string
          id: number
          job: string | null
        }
        Insert: {
          called_at?: string
          id?: never
          job?: string | null
        }
        Update: {
          called_at?: string
          id?: never
          job?: string | null
        }
        Relationships: []
      }
      league_members: {
        Row: {
          active: boolean
          anonymized_at: string | null
          avatar_url: string | null
          created_at: string
          id: string
          is_primary: boolean
          league_id: string
          nickname: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          anonymized_at?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          league_id: string
          nickname: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          anonymized_at?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          league_id?: string
          nickname?: string
          updated_at?: string
          user_id?: string | null
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
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          competition_id: number
          created_at?: string
          id?: string
          join_code: string
          max_members?: number
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          competition_id?: number
          created_at?: string
          id?: string
          join_code?: string
          max_members?: number
          name?: string
          owner_id?: string | null
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
          season_id: number | null
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
          season_id?: number | null
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
          season_id?: number | null
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
            foreignKeyName: "predictions_league_member_id_fkey"
            columns: ["league_member_id"]
            isOneToOne: false
            referencedRelation: "member_league_summary_view"
            referencedColumns: ["member_id"]
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
      pro_seasons: {
        Row: {
          code: string
          created_at: string
          ends_at: string
          id: number
          is_current: boolean
          starts_at: string
        }
        Insert: {
          code: string
          created_at?: string
          ends_at: string
          id?: never
          is_current?: boolean
          starts_at: string
        }
        Update: {
          code?: string
          created_at?: string
          ends_at?: string
          id?: never
          is_current?: boolean
          starts_at?: string
        }
        Relationships: []
      }
      revenuecat_events: {
        Row: {
          app_user_id: string | null
          created_at: string | null
          event_id: string | null
          event_type: string | null
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          app_user_id?: string | null
          created_at?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          app_user_id?: string | null
          created_at?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          can_use_premium_competitions: boolean
          code: string
          description_en: string | null
          description_he: string | null
          has_advanced_stats: boolean
          is_active: boolean
          is_default: boolean
          max_active_leagues: number
          max_members_per_league: number
          name_en: string
          name_he: string
          rank: number
          sort_order: number
          updated_at: string
          weekly_ai_analyses: number | null
        }
        Insert: {
          can_use_premium_competitions?: boolean
          code: string
          description_en?: string | null
          description_he?: string | null
          has_advanced_stats?: boolean
          is_active?: boolean
          is_default?: boolean
          max_active_leagues: number
          max_members_per_league: number
          name_en: string
          name_he: string
          rank?: number
          sort_order?: number
          updated_at?: string
          weekly_ai_analyses?: number | null
        }
        Update: {
          can_use_premium_competitions?: boolean
          code?: string
          description_en?: string | null
          description_he?: string | null
          has_advanced_stats?: boolean
          is_active?: boolean
          is_default?: boolean
          max_active_leagues?: number
          max_members_per_league?: number
          name_en?: string
          name_he?: string
          rank?: number
          sort_order?: number
          updated_at?: string
          weekly_ai_analyses?: number | null
        }
        Relationships: []
      }
      subscription_sync_attempts: {
        Row: {
          last_attempt_at: string
          user_id: string
        }
        Insert: {
          last_attempt_at?: string
          user_id: string
        }
        Update: {
          last_attempt_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_locks: {
        Row: {
          job: string
          last_finished_at: string | null
          last_status: string | null
          locked_at: string
          locked_until: string
        }
        Insert: {
          job: string
          last_finished_at?: string | null
          last_status?: string | null
          locked_at?: string
          locked_until: string
        }
        Update: {
          job?: string
          last_finished_at?: string | null
          last_status?: string | null
          locked_at?: string
          locked_until?: string
        }
        Relationships: []
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
      ugc_blocked_terms: {
        Row: {
          category: string
          created_at: string
          language: string
          term: string
        }
        Insert: {
          category?: string
          created_at?: string
          language?: string
          term: string
        }
        Update: {
          category?: string
          created_at?: string
          language?: string
          term?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_user_id_fkey"
            columns: ["blocker_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          entitlement_id: string | null
          expires_at: string | null
          plan: string
          product_id: string | null
          purchased_at: string | null
          revenuecat_app_user_id: string | null
          season_code: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          entitlement_id?: string | null
          expires_at?: string | null
          plan?: string
          product_id?: string | null
          purchased_at?: string | null
          revenuecat_app_user_id?: string | null
          season_code?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          entitlement_id?: string | null
          expires_at?: string | null
          plan?: string
          product_id?: string | null
          purchased_at?: string | null
          revenuecat_app_user_id?: string | null
          season_code?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_fkey"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
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
      member_league_summary_view: {
        Row: {
          active: boolean | null
          competition_flag: string | null
          competition_id: number | null
          competition_is_free: boolean | null
          competition_name: string | null
          competition_season_id: number | null
          is_primary: boolean | null
          league_id: string | null
          league_name: string | null
          member_id: string | null
          members_count: number | null
          nickname: string | null
          rank: number | null
          total_points: number | null
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
            foreignKeyName: "leagues_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      anonymize_user_account: {
        Args: { p_revenuecat_app_user_id?: string; p_user_id: string }
        Returns: Json
      }
      assert_allowed_public_ugc: {
        Args: { p_value: string }
        Returns: undefined
      }
      block_user: { Args: { p_target_user_id: string }; Returns: Json }
      consume_football_api_budget: {
        Args: { p_calls: number; p_job?: string; p_limit?: number }
        Returns: boolean
      }
      consume_subscription_sync_attempt: {
        Args: { p_cooldown_seconds?: number; p_user_id: string }
        Returns: boolean
      }
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
      delete_owned_league: { Args: { p_league_id: string }; Returns: Json }
      fill_available_league_slots_if_unambiguous: {
        Args: { p_user_id: string }
        Returns: string[]
      }
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
      get_blocked_users: {
        Args: never
        Returns: {
          avatar_url: string
          blocked_user_id: string
          created_at: string
          display_name: string
          id: string
        }[]
      }
      get_competition_leaderboard: {
        Args: { p_competition_id: number }
        Returns: {
          avatar_url: string
          league_id: string
          member_id: string
          nickname: string
          total_points: number
          user_id: string
        }[]
      }
      get_current_season: {
        Args: never
        Returns: {
          code: string
          ends_at: string
          starts_at: string
        }[]
      }
      get_match_ai_summary: {
        Args: { p_match_id: number }
        Returns: {
          ai_summary_en: string
          ai_summary_he: string
        }[]
      }
      get_my_plan: { Args: never; Returns: string }
      get_my_subscription_access: { Args: never; Returns: Json }
      get_plan_limits: {
        Args: { p_plan: string }
        Returns: {
          max_leagues: number
          max_members: number
        }[]
      }
      has_blocked_user: { Args: { p_target_user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_league_member: { Args: { league_id_param: string }; Returns: boolean }
      is_league_owner: { Args: { league_id_param: string }; Returns: boolean }
      join_league: {
        Args: {
          league_join_code: string
          user_avatar_url?: string
          user_nickname: string
        }
        Returns: {
          active: boolean
          anonymized_at: string | null
          avatar_url: string | null
          created_at: string
          id: string
          is_primary: boolean
          league_id: string
          nickname: string
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "league_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leave_league: { Args: { p_league_id: string }; Returns: Json }
      moderate_content_report: {
        Args: { p_decision: string; p_notes?: string; p_report_id: string }
        Returns: Json
      }
      normalize_ugc_for_filter: { Args: { p_value: string }; Returns: string }
      release_sync_lock: {
        Args: { p_job: string; p_status?: string }
        Returns: undefined
      }
      remove_league_member: { Args: { p_member_id: string }; Returns: Json }
      rls_is_member_self: { Args: { _member: string }; Returns: boolean }
      set_primary_league: { Args: { p_league_id: string }; Returns: Json }
      submit_content_report: {
        Args: {
          p_content_type: string
          p_details?: string
          p_league_id?: string
          p_league_member_id?: string
          p_reason: string
        }
        Returns: Json
      }
      try_acquire_sync_lock: {
        Args: { p_job: string; p_lease_seconds?: number }
        Returns: boolean
      }
      unblock_user: { Args: { p_target_user_id: string }; Returns: Json }
      update_my_league_activation: {
        Args: { p_active_member_ids: string[] }
        Returns: Json
      }
      upsert_own_prediction: {
        Args: {
          p_away_score: number
          p_home_score: number
          p_league_member_id: string
          p_match_id: number
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "predictions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
