export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          institution: string | null;
          field_of_study: string | null;
          academic_year: number | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          institution?: string | null;
          field_of_study?: string | null;
          academic_year?: number | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          institution?: string | null;
          field_of_study?: string | null;
          academic_year?: number | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status: "received" | "in_review" | "needs_correction" | "approved";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status?: "received" | "in_review" | "needs_correction" | "approved";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          status?: "received" | "in_review" | "needs_correction" | "approved";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          amount: number;
          type: "income" | "expense" | "debt" | "payment";
          status: "completed" | "pending" | "scheduled";
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: string;
          amount: number;
          type: "income" | "expense" | "debt" | "payment";
          status?: "completed" | "pending" | "scheduled";
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string;
          amount?: number;
          type?: "income" | "expense" | "debt" | "payment";
          status?: "completed" | "pending" | "scheduled";
          due_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          due_date: string;
          priority: "low" | "medium" | "high";
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          due_date: string;
          priority?: "low" | "medium" | "high";
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          due_date?: string;
          priority?: "low" | "medium" | "high";
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          source_key: string;
          title: string;
          description: string | null;
          icon: string;
          severity: "critical" | "warning" | "info";
          channel: "in_app" | "email" | "whatsapp" | "push";
          href: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_key: string;
          title: string;
          description?: string | null;
          icon?: string;
          severity?: "critical" | "warning" | "info";
          channel?: "in_app" | "email" | "whatsapp" | "push";
          href?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_key?: string;
          title?: string;
          description?: string | null;
          icon?: string;
          severity?: "critical" | "warning" | "info";
          channel?: "in_app" | "email" | "whatsapp" | "push";
          href?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          type: "special_exam" | "grade_appeal" | "scholarship" | "inquiry";
          course: string | null;
          title: string;
          description: string;
          status: "received" | "in_progress" | "document_required" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "special_exam" | "grade_appeal" | "scholarship" | "inquiry";
          course?: string | null;
          title: string;
          description: string;
          status?: "received" | "in_progress" | "document_required" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "special_exam" | "grade_appeal" | "scholarship" | "inquiry";
          course?: string | null;
          title?: string;
          description?: string;
          status?: "received" | "in_progress" | "document_required" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
