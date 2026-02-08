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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comparisons: {
        Row: {
          created_at: string
          framework_a_response: string
          framework_b_response: string
          framework_order: string
          id: string
          model_used: string | null
          prompt_version: string | null
          response_time_ms: number | null
          scenario_content: string
          scenario_id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          framework_a_response: string
          framework_b_response: string
          framework_order: string
          id?: string
          model_used?: string | null
          prompt_version?: string | null
          response_time_ms?: number | null
          scenario_content: string
          scenario_id: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          framework_a_response?: string
          framework_b_response?: string
          framework_order?: string
          id?: string
          model_used?: string | null
          prompt_version?: string | null
          response_time_ms?: number | null
          scenario_content?: string
          scenario_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      demographics: {
        Row: {
          age_range: string | null
          ai_familiarity: number | null
          background: string | null
          created_at: string
          id: string
          mh_familiarity: number | null
          participant_id: string
        }
        Insert: {
          age_range?: string | null
          ai_familiarity?: number | null
          background?: string | null
          created_at?: string
          id?: string
          mh_familiarity?: number | null
          participant_id: string
        }
        Update: {
          age_range?: string | null
          ai_familiarity?: number | null
          background?: string | null
          created_at?: string
          id?: string
          mh_familiarity?: number | null
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demographics_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          comparison_id: string
          compassion_a: number | null
          compassion_b: number | null
          created_at: string
          equanimity_a: number | null
          equanimity_b: number | null
          freedom_of_attention_a: number | null
          freedom_of_attention_b: number | null
          id: string
          non_harm_a: number | null
          non_harm_b: number | null
          participant_id: string | null
          preferred_framework: string | null
          reflection_text: string | null
          relational_agency_a: number | null
          relational_agency_b: number | null
        }
        Insert: {
          comparison_id: string
          compassion_a?: number | null
          compassion_b?: number | null
          created_at?: string
          equanimity_a?: number | null
          equanimity_b?: number | null
          freedom_of_attention_a?: number | null
          freedom_of_attention_b?: number | null
          id?: string
          non_harm_a?: number | null
          non_harm_b?: number | null
          participant_id?: string | null
          preferred_framework?: string | null
          reflection_text?: string | null
          relational_agency_a?: number | null
          relational_agency_b?: number | null
        }
        Update: {
          comparison_id?: string
          compassion_a?: number | null
          compassion_b?: number | null
          created_at?: string
          equanimity_a?: number | null
          equanimity_b?: number | null
          freedom_of_attention_a?: number | null
          freedom_of_attention_b?: number | null
          id?: string
          non_harm_a?: number | null
          non_harm_b?: number | null
          participant_id?: string | null
          preferred_framework?: string | null
          reflection_text?: string | null
          relational_agency_a?: number | null
          relational_agency_b?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_sources: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          notebook_id: string
          notebook_name: string | null
          paper_id: string
          processed_at: string | null
          processing_status: string
          source_type: string
          source_url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          notebook_id: string
          notebook_name?: string | null
          paper_id: string
          processed_at?: string | null
          processing_status?: string
          source_type: string
          source_url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          notebook_id?: string
          notebook_name?: string | null
          paper_id?: string
          processed_at?: string | null
          processing_status?: string
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notebook_sources_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          consented_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          pseudonym_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consented_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          pseudonym_id?: string
          withdrawn_at?: string | null
        }
        Update: {
          consented_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          pseudonym_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          abstract: string | null
          api_metadata: Json | null
          arxiv_id: string | null
          authors: Json | null
          created_at: string
          doi: string | null
          id: string
          journal: string | null
          keywords: string[] | null
          pmid: string | null
          promoted_at: string | null
          publication_date: string | null
          rejection_reason: string | null
          semantic_scholar_id: string | null
          source_api: string
          stage: string
          stage_changed_at: string | null
          title: string
          updated_at: string
          zotero_key: string | null
        }
        Insert: {
          abstract?: string | null
          api_metadata?: Json | null
          arxiv_id?: string | null
          authors?: Json | null
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          keywords?: string[] | null
          pmid?: string | null
          promoted_at?: string | null
          publication_date?: string | null
          rejection_reason?: string | null
          semantic_scholar_id?: string | null
          source_api: string
          stage?: string
          stage_changed_at?: string | null
          title: string
          updated_at?: string
          zotero_key?: string | null
        }
        Update: {
          abstract?: string | null
          api_metadata?: Json | null
          arxiv_id?: string | null
          authors?: Json | null
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          keywords?: string[] | null
          pmid?: string | null
          promoted_at?: string | null
          publication_date?: string | null
          rejection_reason?: string | null
          semantic_scholar_id?: string | null
          source_api?: string
          stage?: string
          stage_changed_at?: string | null
          title?: string
          updated_at?: string
          zotero_key?: string | null
        }
        Relationships: []
      }
      research_session_papers: {
        Row: {
          added_at: string
          discovery_method: string | null
          id: string
          notes: string | null
          paper_id: string
          relevance_score: number | null
          session_id: string
          source_paper_id: string | null
        }
        Insert: {
          added_at?: string
          discovery_method?: string | null
          id?: string
          notes?: string | null
          paper_id: string
          relevance_score?: number | null
          session_id: string
          source_paper_id?: string | null
        }
        Update: {
          added_at?: string
          discovery_method?: string | null
          id?: string
          notes?: string | null
          paper_id?: string
          relevance_score?: number | null
          session_id?: string
          source_paper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_session_papers_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_session_papers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "research_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_session_papers_source_paper_id_fkey"
            columns: ["source_paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      research_sessions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          keywords: string[] | null
          name: string
          research_questions: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[] | null
          name: string
          research_questions?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[] | null
          name?: string
          research_questions?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_phase: string
          id: string
          participant_id: string
          snapshot: Json | null
          started_at: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_phase?: string
          id?: string
          participant_id: string
          snapshot?: Json | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_phase?: string
          id?: string
          participant_id?: string
          snapshot?: Json | null
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
