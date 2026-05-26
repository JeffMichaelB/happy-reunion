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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cal_com_booking_uid: string | null
          created_at: string
          ends_at: string | null
          guest_email: string
          guest_id: string | null
          guest_name: string | null
          host_id: string
          id: string
          notes: string | null
          riverside_url: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          topic: string | null
          updated_at: string
        }
        Insert: {
          cal_com_booking_uid?: string | null
          created_at?: string
          ends_at?: string | null
          guest_email: string
          guest_id?: string | null
          guest_name?: string | null
          host_id: string
          id?: string
          notes?: string | null
          riverside_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          topic?: string | null
          updated_at?: string
        }
        Update: {
          cal_com_booking_uid?: string | null
          created_at?: string
          ends_at?: string | null
          guest_email?: string
          guest_id?: string | null
          guest_name?: string | null
          host_id?: string
          id?: string
          notes?: string | null
          riverside_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          episode_id: string | null
          gmail_message_id: string | null
          host_id: string
          id: string
          recipient_email: string
          sent_at: string
          subject: string
        }
        Insert: {
          episode_id?: string | null
          gmail_message_id?: string | null
          host_id: string
          id?: string
          recipient_email: string
          sent_at?: string
          subject: string
        }
        Update: {
          episode_id?: string | null
          gmail_message_id?: string | null
          host_id?: string
          id?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string
          host_id: string
          id: string
          linkedin: string | null
          name: string
          notes: string | null
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email: string
          host_id: string
          id?: string
          linkedin?: string | null
          name: string
          notes?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string
          host_id?: string
          id?: string
          linkedin?: string | null
          name?: string
          notes?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cal_com_booking_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          show_description: string | null
          show_name: string | null
          slug: string | null
          updated_at: string
          workspace_email: string | null
        }
        Insert: {
          avatar_url?: string | null
          cal_com_booking_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          show_description?: string | null
          show_name?: string | null
          slug?: string | null
          updated_at?: string
          workspace_email?: string | null
        }
        Update: {
          avatar_url?: string | null
          cal_com_booking_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          show_description?: string | null
          show_name?: string | null
          slug?: string | null
          updated_at?: string
          workspace_email?: string | null
        }
        Relationships: []
      }
      host_calcom_credentials: {
        Row: {
          user_id: string
          access_token_encrypted: string
          refresh_token_encrypted: string
          expires_at: string | null
          calcom_username: string | null
          selected_event_type_id: number | null
          selected_event_type_slug: string | null
          webhook_id: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          access_token_encrypted: string
          refresh_token_encrypted: string
          expires_at?: string | null
          calcom_username?: string | null
          selected_event_type_id?: number | null
          selected_event_type_slug?: string | null
          webhook_id?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          access_token_encrypted?: string
          refresh_token_encrypted?: string
          expires_at?: string | null
          calcom_username?: string | null
          selected_event_type_id?: number | null
          selected_event_type_slug?: string | null
          webhook_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "draft"
        | "pending_guest"
        | "confirmed"
        | "recorded"
        | "published"
        | "cancelled"
        | "completed"
      user_role: "host" | "guest"
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
      booking_status: [
        "draft",
        "pending_guest",
        "confirmed",
        "recorded",
        "published",
        "cancelled",
        "completed",
      ],
      user_role: ["host", "guest"],
    },
  },
} as const
