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
      agent_collaborations: {
        Row: {
          agent_ids: string[]
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          user_id: string
          workflow_type: string | null
        }
        Insert: {
          agent_ids: string[]
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          user_id: string
          workflow_type?: string | null
        }
        Update: {
          agent_ids?: string[]
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          user_id?: string
          workflow_type?: string | null
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          result: string | null
          started_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          result?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          result?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          capabilities: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_nft: boolean | null
          model: string
          name: string
          nft_contract_address: string | null
          nft_token_id: string | null
          performance_score: number | null
          successful_tasks: number | null
          total_tasks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capabilities?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_nft?: boolean | null
          model: string
          name: string
          nft_contract_address?: string | null
          nft_token_id?: string | null
          performance_score?: number | null
          successful_tasks?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capabilities?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_nft?: boolean | null
          model?: string
          name?: string
          nft_contract_address?: string | null
          nft_token_id?: string | null
          performance_score?: number | null
          successful_tasks?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          agent_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          agent_id: string
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          price: number
          seller_id: string
          sold_at: string | null
          views: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          price: number
          seller_id: string
          sold_at?: string | null
          views?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          seller_id?: string
          sold_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      marketplace_agents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_nft: boolean | null
          model: string | null
          name: string | null
          nft_token_id: string | null
          performance_score: number | null
          successful_tasks: number | null
          total_tasks: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
