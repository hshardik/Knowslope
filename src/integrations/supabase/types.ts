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
      documents: {
        Row: {
          category: Database["public"]["Enums"]["doc_category"]
          content: Json | null
          created_at: string
          created_from_slack: boolean
          creator_id: string | null
          id: string
          published_at: string | null
          published_by: string | null
          screenshots: string[] | null
          slack_channel_id: string | null
          slack_channel_name: string | null
          slack_message_ts: string | null
          slack_thread_id: string | null
          slack_url: string | null
          status: Database["public"]["Enums"]["doc_status"]
          summary: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["doc_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["doc_visibility"]
        }
        Insert: {
          category: Database["public"]["Enums"]["doc_category"]
          content?: Json | null
          created_at?: string
          created_from_slack?: boolean
          creator_id?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          screenshots?: string[] | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_message_ts?: string | null
          slack_thread_id?: string | null
          slack_url?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["doc_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["doc_visibility"]
        }
        Update: {
          category?: Database["public"]["Enums"]["doc_category"]
          content?: Json | null
          created_at?: string
          created_from_slack?: boolean
          creator_id?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          screenshots?: string[] | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_message_ts?: string | null
          slack_thread_id?: string | null
          slack_url?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["doc_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["doc_visibility"]
        }
        Relationships: []
      }
      knowledge_hub_settings: {
        Row: {
          export_formats: string[]
          id: string
          quick_publish_enabled: boolean
          quick_publish_mode: string
          slack_connected: boolean
          slack_required: boolean
          slack_workspace_name: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          export_formats?: string[]
          id?: string
          quick_publish_enabled?: boolean
          quick_publish_mode?: string
          slack_connected?: boolean
          slack_required?: boolean
          slack_workspace_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          export_formats?: string[]
          id?: string
          quick_publish_enabled?: boolean
          quick_publish_mode?: string
          slack_connected?: boolean
          slack_required?: boolean
          slack_workspace_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      publishing_whitelist: {
        Row: {
          added_at: string
          added_by: string
          entry: string
          entry_type: Database["public"]["Enums"]["whitelist_entry_type"]
          id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          entry: string
          entry_type: Database["public"]["Enums"]["whitelist_entry_type"]
          id?: string
        }
        Update: {
          added_at?: string
          added_by?: string
          entry?: string
          entry_type?: Database["public"]["Enums"]["whitelist_entry_type"]
          id?: string
        }
        Relationships: []
      }
      slack_document_notifications: {
        Row: {
          created_at: string
          document_id: string
          id: string
          notification_type: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          notification_type?: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          notification_type?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_document_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_document_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_incoming_items: {
        Row: {
          created_at: string
          id: string
          message_preview: string | null
          notes: string | null
          processed_document_id: string | null
          sent_by_slack_user_id: string | null
          sent_by_slack_user_name: string | null
          slack_channel_id: string | null
          slack_channel_name: string | null
          slack_message_ts: string | null
          slack_thread_id: string | null
          slack_url: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_preview?: string | null
          notes?: string | null
          processed_document_id?: string | null
          sent_by_slack_user_id?: string | null
          sent_by_slack_user_name?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_message_ts?: string | null
          slack_thread_id?: string | null
          slack_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_preview?: string | null
          notes?: string | null
          processed_document_id?: string | null
          sent_by_slack_user_id?: string | null
          sent_by_slack_user_name?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_message_ts?: string | null
          slack_thread_id?: string | null
          slack_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_incoming_items_processed_document_id_fkey"
            columns: ["processed_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_whitelisted: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "publisher" | "member"
      doc_category:
        | "product"
        | "engineering"
        | "support"
        | "sales"
        | "marketing"
        | "operations"
      doc_status: "draft" | "published"
      doc_type:
        | "bug"
        | "feature"
        | "how_to"
        | "troubleshooting"
        | "faq"
        | "policy"
      doc_visibility: "private" | "team"
      whitelist_entry_type: "email" | "domain"
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
      app_role: ["admin", "publisher", "member"],
      doc_category: [
        "product",
        "engineering",
        "support",
        "sales",
        "marketing",
        "operations",
      ],
      doc_status: ["draft", "published"],
      doc_type: [
        "bug",
        "feature",
        "how_to",
        "troubleshooting",
        "faq",
        "policy",
      ],
      doc_visibility: ["private", "team"],
      whitelist_entry_type: ["email", "domain"],
    },
  },
} as const
