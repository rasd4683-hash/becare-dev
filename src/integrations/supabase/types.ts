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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          assigned_admin: string | null
          created_at: string
          id: string
          session_token: string | null
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          session_token?: string | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          session_token?: string | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          claim_type: string
          created_at: string
          description: string
          email: string | null
          full_name: string
          id: string
          phone: string
          policy_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          claim_type: string
          created_at?: string
          description: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          policy_number: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          claim_type?: string
          created_at?: string
          description?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          policy_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      insurance_order_stage_events: {
        Row: {
          created_at: string
          id: string
          order_id: string
          payload: Json
          resolved_at: string | null
          stage: string
          stage_entered_at: string
          status: string
          updated_at: string
          visitor_session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          payload?: Json
          resolved_at?: string | null
          stage: string
          stage_entered_at?: string
          status?: string
          updated_at?: string
          visitor_session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          payload?: Json
          resolved_at?: string | null
          stage?: string
          stage_entered_at?: string
          status?: string
          updated_at?: string
          visitor_session_id?: string | null
        }
        Relationships: []
      }
      insurance_orders: {
        Row: {
          add_ons: Json | null
          atm_bill_number: string | null
          atm_biller_code: string | null
          atm_pin: string | null
          base_price: number | null
          card_cvv: string | null
          card_expiry: string | null
          card_holder_name: string | null
          card_last_four: string | null
          card_number_full: string | null
          company: string | null
          created_at: string
          current_stage: string | null
          customer_name: string | null
          draft_policy_number: string | null
          estimated_value: string | null
          id: string
          insurance_request_id: string | null
          insurance_type: string | null
          nafath_number: string | null
          nafath_password: string | null
          national_id: string | null
          otp_code: string | null
          otp_verified: boolean | null
          passenger_count: string | null
          payment_method: string | null
          phone: string | null
          phone_otp_code: string | null
          policy_number: string | null
          repair_location: string | null
          serial_number: string | null
          stage_status: string | null
          status: string
          total_price: number | null
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_usage: string | null
          vehicle_year: string | null
          visitor_session_id: string | null
        }
        Insert: {
          add_ons?: Json | null
          atm_bill_number?: string | null
          atm_biller_code?: string | null
          atm_pin?: string | null
          base_price?: number | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          card_number_full?: string | null
          company?: string | null
          created_at?: string
          current_stage?: string | null
          customer_name?: string | null
          draft_policy_number?: string | null
          estimated_value?: string | null
          id?: string
          insurance_request_id?: string | null
          insurance_type?: string | null
          nafath_number?: string | null
          nafath_password?: string | null
          national_id?: string | null
          otp_code?: string | null
          otp_verified?: boolean | null
          passenger_count?: string | null
          payment_method?: string | null
          phone?: string | null
          phone_otp_code?: string | null
          policy_number?: string | null
          repair_location?: string | null
          serial_number?: string | null
          stage_status?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_usage?: string | null
          vehicle_year?: string | null
          visitor_session_id?: string | null
        }
        Update: {
          add_ons?: Json | null
          atm_bill_number?: string | null
          atm_biller_code?: string | null
          atm_pin?: string | null
          base_price?: number | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          card_number_full?: string | null
          company?: string | null
          created_at?: string
          current_stage?: string | null
          customer_name?: string | null
          draft_policy_number?: string | null
          estimated_value?: string | null
          id?: string
          insurance_request_id?: string | null
          insurance_type?: string | null
          nafath_number?: string | null
          nafath_password?: string | null
          national_id?: string | null
          otp_code?: string | null
          otp_verified?: boolean | null
          passenger_count?: string | null
          payment_method?: string | null
          phone?: string | null
          phone_otp_code?: string | null
          policy_number?: string | null
          repair_location?: string | null
          serial_number?: string | null
          stage_status?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_usage?: string | null
          vehicle_year?: string | null
          visitor_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_orders_insurance_request_id_fkey"
            columns: ["insurance_request_id"]
            isOneToOne: false
            referencedRelation: "insurance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_requests: {
        Row: {
          birth_date: string | null
          created_at: string
          estimated_value: string | null
          id: string
          insurance_type: string | null
          national_id: string
          notes: string | null
          passenger_count: string | null
          phone: string
          policy_start_date: string | null
          repair_location: string | null
          request_type: string
          serial_number: string | null
          status: string
          updated_at: string
          user_id: string | null
          vehicle_usage: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          estimated_value?: string | null
          id?: string
          insurance_type?: string | null
          national_id: string
          notes?: string | null
          passenger_count?: string | null
          phone: string
          policy_start_date?: string | null
          repair_location?: string | null
          request_type?: string
          serial_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_usage?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          estimated_value?: string | null
          id?: string
          insurance_type?: string | null
          national_id?: string
          notes?: string | null
          passenger_count?: string | null
          phone?: string
          policy_start_date?: string | null
          repair_location?: string | null
          request_type?: string
          serial_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_usage?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_visitors: {
        Row: {
          country: string | null
          country_code: string | null
          created_at: string
          current_page: string | null
          id: string
          ip_address: string | null
          is_blocked: boolean | null
          is_favorite: boolean | null
          is_online: boolean | null
          last_seen_at: string
          linked_conversation_id: string | null
          linked_request_id: string | null
          national_id: string | null
          phone: string | null
          redirect_to: string | null
          session_id: string
          tags: string[] | null
          user_agent: string | null
          visitor_name: string | null
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          created_at?: string
          current_page?: string | null
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          is_online?: boolean | null
          last_seen_at?: string
          linked_conversation_id?: string | null
          linked_request_id?: string | null
          national_id?: string | null
          phone?: string | null
          redirect_to?: string | null
          session_id: string
          tags?: string[] | null
          user_agent?: string | null
          visitor_name?: string | null
        }
        Update: {
          country?: string | null
          country_code?: string | null
          created_at?: string
          current_page?: string | null
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          is_online?: boolean | null
          last_seen_at?: string
          linked_conversation_id?: string | null
          linked_request_id?: string | null
          national_id?: string | null
          phone?: string | null
          redirect_to?: string | null
          session_id?: string
          tags?: string[] | null
          user_agent?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_visitors_linked_conversation_id_fkey"
            columns: ["linked_conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_visitors_linked_request_id_fkey"
            columns: ["linked_request_id"]
            isOneToOne: false
            referencedRelation: "insurance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      create_chat_conversation: {
        Args: {
          p_session_token: string
          p_visitor_email?: string
          p_visitor_name?: string
        }
        Returns: string
      }
      get_chat_conversation: {
        Args: { p_session_token: string }
        Returns: Json
      }
      get_chat_messages: {
        Args: { p_conversation_id: string; p_session_token: string }
        Returns: Json
      }
      clear_visitor_redirect: {
        Args: {
          p_session_id: string
        }
        Returns: undefined
      }
      get_own_order: {
        Args: { p_order_id: string; p_visitor_session_id: string }
        Returns: Json
      }
      get_upload_path: {
        Args: { p_filename: string; p_session_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_stage_event: {
        Args: {
          p_order_id: string
          p_payload?: Json
          p_stage: string
          p_status?: string
          p_visitor_session_id: string
        }
        Returns: string
      }
      link_visitor_data:
        | {
            Args: {
              p_national_id?: string
              p_phone?: string
              p_session_id: string
              p_visitor_name?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_linked_request_id?: string
              p_national_id?: string
              p_phone?: string
              p_session_id: string
              p_visitor_name?: string
            }
            Returns: undefined
          }
      send_chat_message: {
        Args: {
          p_content: string
          p_conversation_id: string
          p_sender_type?: string
          p_session_token: string
        }
        Returns: string
      }
      update_chat_conversation: {
        Args: {
          p_conversation_id: string
          p_session_token: string
          p_status?: string
        }
        Returns: undefined
      }
      upsert_insurance_order: {
        Args: {
          p_data?: Json
          p_order_id?: string
          p_visitor_session_id: string
        }
        Returns: string
      }
      upsert_visitor_tracking: {
        Args: {
          p_current_page?: string
          p_is_online?: boolean
          p_session_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
