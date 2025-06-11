export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      competitions: {
        Row: {
          created_at: string | null;
          end_date: string | null;
          id: string;
          name: string;
          semester: string | null;
          start_date: string | null;
          updated_at: string | null;
          year: number;
        };
        Insert: {
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          semester?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          year: number;
        };
        Update: {
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          semester?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          year?: number;
        };
        Relationships: [];
      };
      event_players: {
        Row: {
          created_at: string | null;
          event_id: number;
          player_id: number;
          role: string;
        };
        Insert: {
          created_at?: string | null;
          event_id: number;
          player_id: number;
          role: string;
        };
        Update: {
          created_at?: string | null;
          event_id?: number;
          player_id?: number;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_players_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          match_id: string | null;
          minute: number | null;
          team_id: string | null;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: never;
          match_id?: string | null;
          minute?: number | null;
          team_id?: string | null;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: never;
          match_id?: string | null;
          minute?: number | null;
          team_id?: string | null;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      join_team_requests: {
        Row: {
          age: number | null;
          created_at: string | null;
          date: string | null;
          first_name: string;
          id: number;
          last_name: string;
          notes: string | null;
          preferred_position: string | null;
          profile_id: string | null;
          status: string | null;
          team_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          age?: number | null;
          created_at?: string | null;
          date?: string | null;
          first_name: string;
          id?: never;
          last_name: string;
          notes?: string | null;
          preferred_position?: string | null;
          profile_id?: string | null;
          status?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          age?: number | null;
          created_at?: string | null;
          date?: string | null;
          first_name?: string;
          id?: never;
          last_name?: string;
          notes?: string | null;
          preferred_position?: string | null;
          profile_id?: string | null;
          status?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "join_team_requests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "join_team_requests_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      lineups: {
        Row: {
          created_at: string | null;
          date: string | null;
          id: number;
          match_id: string | null;
          matrix: Json;
          team_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          id?: never;
          match_id?: string | null;
          matrix: Json;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          id?: never;
          match_id?: string | null;
          matrix?: Json;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lineups_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lineups_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          competition_id: string | null;
          created_at: string | null;
          date: string | null;
          id: string;
          local_score: number | null;
          local_team_id: string | null;
          location: string | null;
          match_time: string | null;
          status: string | null;
          stream_id: string | null;
          updated_at: string | null;
          visitor_score: number | null;
          visitor_team_id: string | null;
        };
        Insert: {
          competition_id?: string | null;
          created_at?: string | null;
          date?: string | null;
          id?: string;
          local_score?: number | null;
          local_team_id?: string | null;
          location?: string | null;
          match_time?: string | null;
          status?: string | null;
          stream_id?: string | null;
          updated_at?: string | null;
          visitor_score?: number | null;
          visitor_team_id?: string | null;
        };
        Update: {
          competition_id?: string | null;
          created_at?: string | null;
          date?: string | null;
          id?: string;
          local_score?: number | null;
          local_team_id?: string | null;
          location?: string | null;
          match_time?: string | null;
          status?: string | null;
          stream_id?: string | null;
          updated_at?: string | null;
          visitor_score?: number | null;
          visitor_team_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_competition_id_fkey";
            columns: ["competition_id"];
            isOneToOne: false;
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_local_team_id_fkey";
            columns: ["local_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_stream_id_fkey";
            columns: ["stream_id"];
            isOneToOne: false;
            referencedRelation: "streams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_visitor_team_id_fkey";
            columns: ["visitor_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          delivery_info: Json | null;
          id: number;
          is_enabled: boolean | null;
          match_id: string | null;
          preference_id: number | null;
          profile_id: string | null;
          sent_at: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          delivery_info?: Json | null;
          id?: never;
          is_enabled?: boolean | null;
          match_id?: string | null;
          preference_id?: number | null;
          profile_id?: string | null;
          sent_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          delivery_info?: Json | null;
          id?: never;
          is_enabled?: boolean | null;
          match_id?: string | null;
          preference_id?: number | null;
          profile_id?: string | null;
          sent_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_preference_id_fkey";
            columns: ["preference_id"];
            isOneToOne: false;
            referencedRelation: "preferences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          age: number | null;
          created_at: string | null;
          first_name: string;
          id: number;
          last_name: string;
          nickname: string | null;
          position: string | null;
          profile_id: string | null;
          team_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          age?: number | null;
          created_at?: string | null;
          first_name: string;
          id?: never;
          last_name: string;
          nickname?: string | null;
          position?: string | null;
          profile_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          age?: number | null;
          created_at?: string | null;
          first_name?: string;
          id?: never;
          last_name?: string;
          nickname?: string | null;
          position?: string | null;
          profile_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      preferences: {
        Row: {
          channel: string;
          created_at: string | null;
          id: number;
          is_enabled: boolean | null;
          lead_time_minutes: number;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          channel: string;
          created_at?: string | null;
          id?: never;
          is_enabled?: boolean | null;
          lead_time_minutes?: number;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          channel?: string;
          created_at?: string | null;
          id?: never;
          is_enabled?: boolean | null;
          lead_time_minutes?: number;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: number | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: number | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: number | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      streams: {
        Row: {
          created_at: string | null;
          end_time: string | null;
          id: string;
          match_id: string | null;
          notes: string | null;
          platform: string | null;
          start_time: string | null;
          type: string;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          match_id?: string | null;
          notes?: string | null;
          platform?: string | null;
          start_time?: string | null;
          type: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string | null;
          end_time?: string | null;
          id?: string;
          match_id?: string | null;
          notes?: string | null;
          platform?: string | null;
          start_time?: string | null;
          type?: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "streams_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      team_competitions: {
        Row: {
          competition_id: string;
          created_at: string | null;
          points: number | null;
          position: number | null;
          team_id: string;
          updated_at: string | null;
        };
        Insert: {
          competition_id: string;
          created_at?: string | null;
          points?: number | null;
          position?: number | null;
          team_id: string;
          updated_at?: string | null;
        };
        Update: {
          competition_id?: string;
          created_at?: string | null;
          points?: number | null;
          position?: number | null;
          team_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_competitions_competition_id_fkey";
            columns: ["competition_id"];
            isOneToOne: false;
            referencedRelation: "competitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_competitions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          captain_id: string | null;
          created_at: string | null;
          id: string;
          major: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          captain_id?: string | null;
          created_at?: string | null;
          id?: string;
          major?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          captain_id?: string | null;
          created_at?: string | null;
          id?: string;
          major?: string | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey";
            columns: ["captain_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_favorite_matches: {
        Row: {
          favorited_at: string | null;
          match_id: string;
          profile_id: string;
        };
        Insert: {
          favorited_at?: string | null;
          match_id: string;
          profile_id: string;
        };
        Update: {
          favorited_at?: string | null;
          match_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorite_matches_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorite_matches_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_favorite_teams: {
        Row: {
          favorited_at: string | null;
          profile_id: string;
          team_id: string;
        };
        Insert: {
          favorited_at?: string | null;
          profile_id: string;
          team_id: string;
        };
        Update: {
          favorited_at?: string | null;
          profile_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorite_teams_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorite_teams_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
